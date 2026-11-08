#!/usr/bin/env node
// Check GDPR EU Agent — static code scanner (no dependencies).
// Finds where a codebase loads trackers, sets cookies or storage, configures Consent Mode, or uses fingerprinting APIs.
// A static finding is a RISK and a pointer, never proof: consent gating often lives in a CMP or tag manager outside the code.
// Always confirm on the live site.
//
//   node scan-code.mjs [path] [--json]

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';
import { classifyName } from '../crawler/signatures.mjs';

const root = process.argv.slice(2).find((a) => !a.startsWith('--')) || '.';
const asJson = process.argv.includes('--json');

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', 'vendor', 'coverage', '.venv', 'venv', '__pycache__', 'target', '.gradle', 'Pods', '.cache', '.turbo', '.svelte-kit']);
const EXT = new Set(['.html', '.htm', '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.php', '.twig', '.blade', '.erb', '.ejs', '.hbs', '.njk', '.liquid', '.py', '.rb', '.cs', '.cshtml', '.razor', '.java', '.kt', '.swift', '.dart', '.go', '.json', '.gradle', '.xml', '.plist', '.yaml', '.yml', '.tf', '.toml']);
const SPECIAL = new Set(['Podfile', 'Gemfile', 'package.json', 'pubspec.yaml', 'build.gradle', 'build.gradle.kts', 'AndroidManifest.xml', 'Info.plist']);
const MAX_BYTES = 1_500_000;

/** [id, priority, title, regex, note] */
const RULES = [
  ['S1', 'P1', 'Tracker tag or SDK loaded', /googletagmanager\.com\/gtag\/js|googletagmanager\.com\/gtm\.js|google-analytics\.com\/(analytics|ga)\.js|connect\.facebook\.net\/[^"']*fbevents\.js|fbq\(\s*['"]init|ttq\.load\(|analytics\.tiktok\.com|static\.hotjar\.com|snap\.licdn\.com|clarity\.ms\/tag|bat\.bing\.com|mc\.yandex\.ru\/metrika|cdn\.mxpnl\.com|cdn\.segment\.com|static\.ads-twitter\.com|s\.pinimg\.com\/ct|c\.seznam\.cz\/js\/rc\.js|im9\.cz/i, 'Check that it only loads after consent (CMP blocking, consent callback, or Consent Mode with all keys denied by default).'],
  ['S2', 'P1', 'Consent management platform (CMP) integration', /otSDKStub\.js|cdn\.cookielaw\.org|consent\.cookiebot\.(com|eu)\/uc\.js|app\.usercentrics\.eu|sdk\.privacy-center\.org|didomi|cdn\.iubenda\.com|cookieyes\.com|klaro(\.js|config)|vanilla-cookieconsent|orestbida|osano\.com|complianz|termly\.io/i, 'CMP found. It must load before any tracker and block them until consent.'],
  ['S3', 'P1', 'Consent Mode configuration', /gtag\(\s*['"]consent['"]\s*,\s*['"](default|update)['"]/, 'The default call must deny ad_storage, analytics_storage, ad_user_data and ad_personalization (at least for EEA) and run before any config/event call.'],
  ['S3b', 'P2', 'Consent Mode options that need review', /url_passthrough|ads_data_redaction|wait_for_update/, 'Not a violation by itself; a human should confirm the setup.'],
  ['S4', 'P1', 'Cookie written in code', /document\.cookie\s*=|cookieStore\.set\(|Cookies\.set\(|\bres\.cookie\(|\bsetcookie\s*\(|\.set_cookie\(|Response\.Cookies\.Append|cookies\(\)\.set\(|Cookie::queue|cookies\[\s*:[a-z_]+\s*\]\s*=|http\.SetCookie\(/, 'Decide whether the cookie is strictly necessary. If not, it must wait for consent.'],
  ['S5', 'P2', 'Client-side storage written', /localStorage\.setItem\(|sessionStorage\.setItem\(|indexedDB\.open\(/, 'Storage is covered by art. 5(3) like cookies. Necessary only if the user requested the function.'],
  ['S6', 'P2', 'Fingerprinting-capable API', /\.toDataURL\(|getImageData\(|UNMASKED_(RENDERER|VENDOR)_WEBGL|OfflineAudioContext|@fingerprintjs|fingerprintjs|clientjs/i, 'Fingerprinting needs consent like cookies (EDPB Guidelines 2/2023). Image processing can be legitimate — check the purpose.'],
  ['S7', 'P2', 'Mobile analytics / ads SDK', /firebase[-_]analytics|com\.google\.firebase:firebase-analytics|FirebaseAnalytics|facebook-android-sdk|FBSDKCoreKit|FacebookCore|appsflyer|com\.adjust\.sdk|Adjust\b|branch\.io|google-mobile-ads|GoogleMobileAds/, 'Mobile apps fall under art. 5(3) too. Collection should be off by default until consent; confirm the vendor’s exact flag names.'],
  ['S8', 'P2', 'Tracking dependency', /"(react-ga4?|react-gtm-module|@next\/third-parties|@vercel\/analytics|mixpanel-browser|@amplitude\/[^"]+|posthog-js|@segment\/[^"]+|@sentry\/replay|hotjar[^"]*|react-facebook-pixel|@hotjar\/browser|vue-gtag|ngx-google-analytics|nuxt-gtag)"\s*:/, 'Check where it is initialised and whether that waits for consent.'],
  ['S10', 'P2', 'Server-side tagging / tracking proxy', /server[-_ ]side[-_ ]tagging|sgtm|stape\.io|\/g\/collect|gtm-server|metrics\.[a-z0-9-]+\.(com|cz|de|eu)|CNAME[^\n]*(google|facebook|adobe|omtrdc)/i, 'Proxying trackers through your own domain does not remove the consent duty.'],
  ['S11', 'P3', 'Deprecated TCF API call', /__tcfapi\(\s*['"]getTCData['"]/, 'Use addEventListener instead of getTCData (TCF v2.2).'],
];

const CONSENT_HINT = /consent|cookieconsent|CookieConsent|Cookiebot|OneTrust|Optanon|usercentrics|didomi|iubenda|klaro|cmplz|data-cookiecategory|data-cookieconsent|data-category|type=["']text\/plain["']|hasConsent|consentGiven|onConsent|souhlas/;

const findings = [];
let scanned = 0;
function walk(dir) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name) && !e.name.startsWith('.')) walk(p); continue; }
    if (!(EXT.has(extname(e.name)) || SPECIAL.has(e.name))) continue;
    if (/\.min\.(js|css)$/.test(e.name) || /lock\.json$|\.lock$/.test(e.name)) continue;
    let st; try { st = statSync(p); } catch { continue; }
    if (st.size > MAX_BYTES) continue;
    scan(p);
  }
}
function scan(file) {
  scanned++;
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  const rel = relative(root, file) || basename(file);
  lines.forEach((line, i) => {
    for (const [id, prio, title, re, note] of RULES) {
      if (!re.test(line)) continue;
      const near = lines.slice(Math.max(0, i - 25), i + 25).join('\n');
      const gated = id === 'S1' || id === 'S4' || id === 'S5' ? CONSENT_HINT.test(near) : null;
      let detail = '';
      if (id === 'S4') {
        const m = line.match(/document\.cookie\s*=\s*['"`]\s*([^=;'"`\s]+)\s*=/) || line.match(/(?:set|cookie|Append|setcookie)\(\s*['"]([^'"]+)['"]/i);
        if (m) { const c = classifyName(m[1], 'cookie'); detail = `cookie "${m[1]}"` + (c.vendor ? ` = ${c.vendor} (${c.category})` : c.category === 'likely-essential' ? ' (name suggests strictly necessary)' : ' (unknown purpose)'); }
      }
      if (id === 'S3' && /['"]default['"]/.test(line)) {
        const block = lines.slice(i, i + 8).join(' ');
        const keys = ['ad_storage', 'analytics_storage', 'ad_user_data', 'ad_personalization'];
        const bad = keys.filter((k) => !new RegExp(k + `\\s*['"]?\\s*:\\s*['"]denied`).test(block));
        detail = bad.length ? `default does not set ${bad.join(', ')} to "denied"` : 'all four v2 keys default to "denied"';
        const configBefore = lines.slice(0, i).some((l) => /gtag\(\s*['"](config|event)['"]/.test(l));
        if (configBefore) detail += '; a config/event call appears earlier in this file';
      }
      findings.push({ id, priority: prio, title, file: rel, line: i + 1, code: line.trim().slice(0, 160), consentHintNearby: gated, detail, note });
    }
  });
}

walk(root);

if (asJson) {
  console.log(JSON.stringify({ tool: 'Check GDPR EU Agent code scanner', version: '0.1.0', root, scannedFiles: scanned, findings }, null, 2));
} else {
  console.log(`# Code scan — ${root}\n\nScanned ${scanned} files. Static findings are risks and pointers, not proof. Confirm every one on the live site.\n`);
  if (!findings.length) console.log('No tracker, cookie, storage, Consent Mode or fingerprinting patterns found. (This does not prove the site is clean: tags can come from a tag manager or CMS configuration outside the code.)');
  const byId = {};
  for (const f of findings) (byId[f.id] ||= []).push(f);
  for (const [id, list] of Object.entries(byId)) {
    console.log(`## ${id} (${list[0].priority}) — ${list[0].title} — ${list.length}×\n_${list[0].note}_\n`);
    for (const f of list.slice(0, 40)) {
      const g = f.consentHintNearby === null ? '' : f.consentHintNearby ? ' · consent-related code within 25 lines (verify it really gates this)' : ' · **no consent-related code nearby**';
      console.log(`- \`${f.file}:${f.line}\`${g}${f.detail ? ' · ' + f.detail : ''}\n  \`${f.code.replace(/`/g, "'")}\``);
    }
    if (list.length > 40) console.log(`- … ${list.length - 40} more`);
    console.log('');
  }
}
