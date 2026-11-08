#!/usr/bin/env node
// Check GDPR EU Agent — evidence crawler.
// Visits a site in three fresh browser profiles (no interaction / "reject all" / "accept all")
// and records cookies, storage, requests, banner controls, Consent Mode and fingerprinting calls.
//
//   node crawl.mjs <url> [--out DIR] [--locale cs-CZ] [--pages 2] [--chromium PATH] [--block-third-party]
//
// Output: DIR/evidence.json (all raw facts) and DIR/summary.md (findings for the agent and the human reviewer).
// The crawl itself processes data (it visits a site like a user). Only crawl sites you are allowed to test.
// Not legal advice: findings are "observed facts", "presumptive violations", "warnings" or "needs human review".

import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { classifyRequest, classifyName } from './signatures.mjs';
import { PHRASES, WITHDRAW_RE, WITHDRAW_SETTINGS_RE, POLICY_RE, detectInPage } from './banner.mjs';

const VERSION = '0.1.0';

// ---------- arguments ----------
const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : def; };
const flag = (name) => argv.includes('--' + name);
const target = argv.find((a) => /^https?:\/\//.test(a));
if (!target) {
  console.error('usage: node crawl.mjs <https://site> [--out DIR] [--locale cs-CZ] [--pages 2] [--chromium PATH] [--block-third-party]');
  process.exit(2);
}
const host = new URL(target).hostname;
const OUT = resolve(opt('out', join(tmpdir(), 'gdpreu', host + '-' + new Date().toISOString().replace(/[:.]/g, '-'))));
const LOCALE = opt('locale', 'en-IE');
const PAGES = Number(opt('pages', '2'));
const TIMEOUT = Number(opt('timeout', '30000'));
mkdirSync(OUT, { recursive: true });

// ---------- playwright (installed by the agent into the plugin data dir, or available globally) ----------
async function loadPlaywright() {
  const bases = [process.env.GDPREU_DEPS, process.env.CLAUDE_PLUGIN_DATA, process.cwd(), new URL('.', import.meta.url).pathname].filter(Boolean);
  for (const b of bases) {
    try { return createRequire(join(b, 'package.json'))('playwright'); } catch {}
  }
  try { return await import('playwright'); } catch {}
  console.error('Playwright is not installed. Install it once with:\n  npm install --prefix "${CLAUDE_PLUGIN_DATA:-$HOME/.gdpreu}" playwright && npx --prefix "${CLAUDE_PLUGIN_DATA:-$HOME/.gdpreu}" playwright install chromium\nthen set GDPREU_DEPS to that folder if it is not CLAUDE_PLUGIN_DATA.');
  process.exit(3);
}
const { chromium } = await loadPlaywright();

function chromiumPath() {
  const p = opt('chromium', process.env.GDPREU_CHROMIUM);
  if (p) return p;
  return undefined; // Playwright's own browser
}

// ---------- in-page instrumentation (runs before any site script) ----------
const INSTRUMENT = () => {
  const log = (api) => {
    const st = (new Error().stack || '').split('\n').map((l) => (l.match(/(https?:\/\/[^\s)]+)/) || [])[1]).filter(Boolean);
    (window.__gdpreuFp = window.__gdpreuFp || []).push({ api, script: st[0] ? st[0].replace(/:\d+:\d+$/, '') : null, t: Date.now() });
  };
  const wrap = (obj, name, api, cond) => {
    if (!obj || !obj[name]) return;
    const orig = obj[name];
    obj[name] = function (...a) { try { if (!cond || cond(this, a)) log(api); } catch {} return orig.apply(this, a); };
  };
  try { wrap(HTMLCanvasElement.prototype, 'toDataURL', 'canvas.toDataURL'); } catch {}
  try { wrap(CanvasRenderingContext2D.prototype, 'getImageData', 'canvas.getImageData'); } catch {}
  try { wrap(WebGLRenderingContext.prototype, 'getParameter', 'webgl.UNMASKED_RENDERER/VENDOR', (_t, a) => a[0] === 37445 || a[0] === 37446); } catch {}
  try { for (const C of ['AudioContext', 'OfflineAudioContext']) { const O = window[C]; if (O) window[C] = class extends O { constructor(...a) { super(...a); log('audio.' + C); } }; } } catch {}
};

// ---------- helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const siteOf = (h) => h.split('.').slice(-2).join('.');
const firstParty = (u) => { try { return siteOf(new URL(u).hostname) === siteOf(host); } catch { return false; } };

function luminance(rgb) {
  const m = (rgb || '').match(/\d+(\.\d+)?/g); if (!m) return null;
  const [r, g, b] = m.slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const la = luminance(a), lb = luminance(b); if (la == null || lb == null) return null;
  return Math.round(((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)) * 100) / 100;
}
const transparent = (c) => !c || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/.test(c);

async function detect(page) {
  const out = [];
  for (const [i, f] of page.frames().entries()) {
    try { out.push(await f.evaluate(detectInPage, { phrases: PHRASES, ns: 'f' + i })); } catch {}
  }
  const controls = out.flatMap((r, i) => r.controls.map((c) => ({ ...c, frame: i })));
  return {
    lang: out[0]?.lang ?? null,
    controls,
    toggles: out.flatMap((r) => r.toggles),
    toggleFrames: Object.fromEntries(out.flatMap((r, i) => r.toggles.map((t) => [t.gid, i]))),
    bannerText: out.map((r) => r.bannerText).filter(Boolean).join(' | ').slice(0, 1500),
  };
}

async function click(page, control) {
  const f = page.frames()[control.frame] || page.mainFrame();
  await f.locator(`[data-gdpreu-id="${control.gid}"]`).first().click({ timeout: 5000 });
}

async function snapshot(context, page) {
  const cookies = (await context.cookies()).map((c) => ({
    name: c.name, domain: c.domain, path: c.path, expires: c.expires > 0 ? new Date(c.expires * 1000).toISOString() : 'session',
    lifetimeDays: c.expires > 0 ? Math.round((c.expires * 1000 - Date.now()) / 864e5) : 0,
    secure: c.secure, httpOnly: c.httpOnly, sameSite: c.sameSite, thirdParty: !firstParty('https://' + c.domain.replace(/^\./, '')),
    ...classifyName(c.name, 'cookie'),
  }));
  const storage = [];
  for (const f of page.frames()) {
    try {
      const s = await f.evaluate(() => ({ origin: location.origin, local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
      for (const k of s.local) storage.push({ origin: s.origin, area: 'localStorage', key: k, ...classifyName(k, 'storage') });
      for (const k of s.session) storage.push({ origin: s.origin, area: 'sessionStorage', key: k, ...classifyName(k, 'storage') });
    } catch {}
  }
  let consentMode = null, fp = [];
  try {
    consentMode = await page.evaluate(() => {
      const dl = Array.isArray(window.dataLayer) ? window.dataLayer : [];
      const calls = dl.map((e) => (e && typeof e === 'object' && 'length' in e && typeof e[0] === 'string') ? Array.from(e) : null).filter(Boolean);
      const idx = (pred) => calls.findIndex(pred);
      const def = calls.find((c) => c[0] === 'consent' && c[1] === 'default');
      return {
        dataLayerPresent: Array.isArray(window.dataLayer),
        defaultCall: def ? def[2] : null,
        defaultIndex: idx((c) => c[0] === 'consent' && c[1] === 'default'),
        firstConfigIndex: idx((c) => c[0] === 'config' || c[0] === 'event'),
        updates: calls.filter((c) => c[0] === 'consent' && c[1] === 'update').map((c) => c[2]),
      };
    });
    fp = await page.evaluate(() => window.__gdpreuFp || []);
  } catch {}
  return { cookies, storage, consentMode, fingerprinting: fp };
}

async function internalLinks(page, n) {
  try {
    const links = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map((a) => a.href));
    const base = new URL(page.url());
    return [...new Set(links.filter((l) => { try { const u = new URL(l); return u.origin === base.origin && u.pathname !== base.pathname && !/\.(pdf|jpg|png|zip)$/i.test(u.pathname); } catch { return false; } }))].slice(0, n);
  } catch { return []; }
}

async function settle(page) {
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch {}
  await sleep(2500);
}

// ---------- one state ----------
async function runState(browser, kind) {
  const context = await browser.newContext({ locale: LOCALE, timezoneId: 'Europe/Brussels', viewport: { width: 1366, height: 900 } });
  await context.addInitScript(INSTRUMENT);
  if (flag('block-third-party')) {
    await context.route('**/*', (route) => (firstParty(route.request().url()) || route.request().url().startsWith('data:') ? route.continue() : route.abort()));
  }
  const page = await context.newPage();
  const requests = []; let stage = 'before-choice';
  page.on('request', (r) => {
    const sig = classifyRequest(r.url());
    requests.push({ stage, url: r.url().slice(0, 300), type: r.resourceType(), thirdParty: !firstParty(r.url()), vendor: sig?.vendor || null, category: sig?.category || null });
  });

  const result = { state: kind, errors: [] };
  try {
    await page.goto(target, { waitUntil: 'load', timeout: TIMEOUT });
  } catch (e) { result.errors.push('navigation: ' + e.message.split('\n')[0]); }
  await settle(page);
  result.banner = await detect(page);
  result.before = await snapshot(context, page);
  if (kind === 'none') {
    try { await page.screenshot({ path: join(OUT, 'initial.png') }); result.screenshot = 'initial.png'; } catch {}
  }

  if (kind !== 'none') {
    const inBanner = result.banner.controls.filter((c) => c.inBanner);
    const pick = (k, list = inBanner) => list.find((c) => c.kind === k) || null;
    const clicks = [];
    try {
      if (kind === 'reject') {
        let c = pick('reject');
        if (c) { await click(page, c); clicks.push(c.label); }
        else if ((c = pick('settings'))) {
          await click(page, c); clicks.push(c.label); await sleep(1500);
          const second = await detect(page);
          result.secondLayer = second;
          let r2 = second.controls.find((x) => x.kind === 'reject');
          if (!r2) {
            // Like a real user: untick every pre-ticked optional purpose, then save.
            for (const t of second.toggles.filter((x) => x.checked && !x.disabled)) {
              try { await click(page, { ...t, frame: second.toggleFrames?.[t.gid] ?? 0 }); clicks.push('untick ' + (t.label || 'toggle')); } catch {}
            }
            r2 = second.controls.find((x) => x.kind === 'save');
          }
          if (r2) { await click(page, r2); clicks.push(r2.label); }
        }
      } else {
        const c = pick('accept');
        if (c) { await click(page, c); clicks.push(c.label); }
      }
    } catch (e) { result.errors.push('click: ' + e.message.split('\n')[0]); }
    result.clicks = clicks;
    result.choiceMade = clicks.length > 0;
    stage = 'after-choice';
    await sleep(2000);
    try { await page.reload({ waitUntil: 'load', timeout: TIMEOUT }); } catch (e) { result.errors.push('reload: ' + e.message.split('\n')[0]); }
    await settle(page);
    for (const link of await internalLinks(page, PAGES)) {
      try { await page.goto(link, { waitUntil: 'load', timeout: TIMEOUT }); await settle(page); } catch {}
    }
    result.after = await snapshot(context, page);
    if (kind === 'accept') {
      // Withdrawal: is there a persistent way back to the consent choice? Look on the start page.
      try { await page.goto(target, { waitUntil: 'load', timeout: TIMEOUT }); await settle(page); } catch {}
      const now = await detect(page);
      result.withdrawControls = now.controls
        .filter((c) => WITHDRAW_RE.test(c.label || '') && WITHDRAW_SETTINGS_RE.test(c.label || ''))
        .map((c) => ({ label: c.label, tag: c.tag, href: c.href }));
      result.policyLinks = [...new Map(now.controls.filter((c) => c.href && !/#$/.test(c.href) && POLICY_RE.test((c.label || '') + ' ' + c.href)).map((c) => [c.href, { label: c.label, href: c.href }])).values()].slice(0, 8);
    }
  }
  result.requests = requests;
  await context.close();
  return result;
}

// ---------- findings ----------
const TRACKING = new Set(['analytics', 'advertising', 'session-replay', 'social', 'fingerprinting']);

function findings(states) {
  const [none, rej, acc] = states;
  const F = [];
  const add = (id, level, title, evidence) => F.push({ id, level, title, evidence });
  const trk = (list) => list.filter((x) => TRACKING.has(x.category));
  const uniq = (arr, key) => [...new Map(arr.map((x) => [key(x), x])).values()];

  // L1–L3: before any choice
  const c0 = trk(none.before.cookies), s0 = trk(none.before.storage), r0 = uniq(trk(none.requests), (r) => r.vendor);
  if (c0.length) add('L1', 'presumptive violation', 'Tracking cookies set before any consent', c0.map((c) => `${c.name} (${c.vendor}, ${c.domain}, ${c.lifetimeDays} days)`));
  if (s0.length) add('L2', 'presumptive violation', 'Tracking identifiers in browser storage before any consent', s0.map((s) => `${s.area} ${s.key} (${s.vendor}, ${s.origin})`));
  if (r0.length) add('L3', 'presumptive violation', 'Requests to trackers before any consent', r0.map((r) => `${r.vendor}: ${r.url}`));
  const tm0 = uniq(none.requests.filter((r) => r.category === 'tag-manager'), (r) => r.vendor);
  if (tm0.length && !r0.length) add('L3', 'warning', 'Tag manager loads before consent (acceptable only if no tag fires and Consent Mode defaults to denied)', tm0.map((r) => r.url));

  // Banner
  const b = none.banner;
  const inB = b.controls.filter((c) => c.inBanner);
  const acc0 = inB.find((c) => c.kind === 'accept'), rej0 = inB.find((c) => c.kind === 'reject'), set0 = inB.find((c) => c.kind === 'settings');
  if (!acc0 && !rej0) {
    add('L6', (c0.length || r0.length) ? 'presumptive violation' : 'observed fact',
      'No consent banner detected' + ((c0.length || r0.length) ? ' although tracking happens' : ''), ['If the site sets only strictly necessary cookies, no banner is needed — a human must confirm that.']);
  } else if (acc0 && !rej0) {
    add('L6', 'presumptive violation', 'No "reject all" on the first layer while "accept" is there', [`accept: "${acc0.label}"`, set0 ? `settings: "${set0.label}"` : 'no settings button detected', `reject took ${rej.clicks?.length ?? 0} click(s): ${(rej.clicks || []).join(' → ') || 'not possible'}`, 'Hard rule in ES, DE (courts), SE, NO, FI; strong expectation in most others; IT: best practice only.']);
  } else if (rej0 && rej0.tag === 'a' && acc0 && acc0.tag !== 'a') {
    add('L7', 'warning', 'Reject is a text link while accept is a button', [`accept: <${acc0.tag}> "${acc0.label}"`, `reject: <a> "${rej0.label}"`]);
  }

  // L7 visual parity
  if (acc0 && rej0) {
    const area = (c) => c.rect.w * c.rect.h;
    const ratio = Math.round((area(acc0) / Math.max(1, area(rej0))) * 100) / 100;
    const ca = contrast(acc0.style.color, transparent(acc0.style.bg) ? 'rgb(255,255,255)' : acc0.style.bg);
    const cr = contrast(rej0.style.color, transparent(rej0.style.bg) ? 'rgb(255,255,255)' : rej0.style.bg);
    const filledAcc = !transparent(acc0.style.bg), filledRej = !transparent(rej0.style.bg);
    const issues = [];
    if (ratio >= 1.5) issues.push(`accept button is ${ratio}× larger than reject`);
    if (filledAcc && !filledRej) issues.push('accept is a filled button, reject has no background');
    if (cr != null && cr < 3 && (ca == null || ca >= 4.5)) issues.push(`reject text contrast is only ${cr}:1 (accept ${ca}:1)`);
    if (Number(acc0.style.fontWeight) - Number(rej0.style.fontWeight) >= 200) issues.push('accept text is much bolder');
    if (issues.length) add('L7', 'warning', 'Accept and reject are not visually equivalent (heuristic, no regulator gives numeric thresholds)', issues);
    if (rej0.style.color === acc0.style.color && rej0.style.bg === acc0.style.bg && ratio < 1.5) {
      add('L7', 'observed fact', 'Accept and reject look equivalent', [`accept "${acc0.label}" vs reject "${rej0.label}"`]);
    }
  }

  // L8 pre-ticked
  const pre = [...b.toggles, ...(rej.secondLayer?.toggles || [])].filter((t) => t.checked && !t.disabled);
  if (pre.length) add('L8', 'presumptive violation', 'Pre-ticked non-essential purposes', uniq(pre, (t) => t.label).map((t) => t.label || '(unlabelled toggle)'));

  // L4 after reject
  if (rej.choiceMade) {
    const cR = trk(rej.after.cookies), sR = trk(rej.after.storage), rR = uniq(trk(rej.requests.filter((r) => r.stage === 'after-choice')), (r) => r.vendor);
    if (cR.length) add('L4', 'presumptive violation', 'Tracking cookies present after "reject all"', cR.map((c) => `${c.name} (${c.vendor}, ${c.domain})`));
    if (sR.length) add('L4', 'presumptive violation', 'Tracking storage present after "reject all"', sR.map((s) => `${s.key} (${s.vendor})`));
    if (rR.length) add('L4', 'presumptive violation', 'Tracker requests after "reject all"', rR.map((r) => `${r.vendor}: ${r.url}`));
    if (!cR.length && !sR.length && !rR.length) add('L4', 'observed fact', 'No known trackers observed after "reject all"', [`clicks: ${rej.clicks.join(' → ')}`]);
  } else if (acc0 || rej0) {
    add('L4', 'needs human review', 'The crawler could not complete a refusal; test "reject all" manually', rej.errors);
  }

  // L5 calibration
  if (acc.choiceMade) {
    const only = [...new Set([
      ...trk(acc.requests.filter((r) => r.stage === 'after-choice')).map((r) => r.vendor),
      ...trk(acc.after.cookies).map((c) => c.vendor), ...trk(acc.after.storage).map((s) => s.vendor),
    ])];
    add('L5', 'observed fact', 'Trackers seen after "accept all" (calibration: these should be absent before consent and after refusal)', only.length ? only : ['none of the known trackers']);
  }

  // L12 Consent Mode
  const cm = none.before.consentMode;
  const googleSeen = none.requests.some((r) => /Google/.test(r.vendor || ''));
  if (googleSeen && cm) {
    const keys = ['ad_storage', 'analytics_storage', 'ad_user_data', 'ad_personalization'];
    if (!cm.defaultCall) add('L12', 'warning', 'Google tags present but no Consent Mode default was found in dataLayer', ['Google requires Consent Mode v2 for EEA traffic (contractual, not EU law).']);
    else {
      const notDenied = keys.filter((k) => cm.defaultCall[k] !== 'denied');
      if (notDenied.length) add('L12', 'warning', 'Consent Mode default does not deny all four v2 keys', notDenied.map((k) => `${k} = ${cm.defaultCall[k] ?? 'missing'}`));
      if (cm.firstConfigIndex >= 0 && cm.defaultIndex > cm.firstConfigIndex) add('L12', 'warning', 'Consent Mode default is set after the first config/event call', []);
    }
  }

  // L14 withdrawal
  if (acc.choiceMade) {
    if (acc.withdrawControls?.length) add('L14', 'observed fact', 'A control to change or withdraw consent is visible after accepting', acc.withdrawControls.map((w) => `"${w.label}"`));
    else add('L14', 'presumptive violation', 'No visible way to change or withdraw consent after accepting (footer link or floating icon not detected)', ['Withdrawal must be as easy as giving consent (GDPR art. 7(3)). Confirm manually: CMP icons are sometimes images without text.']);
  }

  // L19 fingerprinting
  const fps = uniq(none.before.fingerprinting, (f) => f.api + f.script);
  if (fps.length) add('L19', 'warning', 'Fingerprinting-capable APIs called before consent (can also be legitimate, e.g. image editing)', fps.map((f) => `${f.api} by ${f.script || 'inline script'}`));

  // L21 hygiene, L22 language, unknown cookies
  const insecure = none.before.cookies.filter((c) => !c.secure && target.startsWith('https'));
  if (insecure.length) add('L21', 'warning', 'Cookies without the Secure attribute on an HTTPS site', insecure.map((c) => c.name).slice(0, 20));
  const unknown = uniq([...none.before.cookies, ...(acc.after?.cookies || [])].filter((c) => c.category === 'unknown'), (c) => c.name);
  if (unknown.length) add('HR', 'needs human review', 'Cookies the crawler could not classify — decide whether each is strictly necessary', unknown.map((c) => `${c.name} (${c.domain}, ${c.lifetimeDays} days, ${c.thirdParty ? 'third-party' : 'first-party'})`));
  add('L22', 'needs human review', 'Banner language vs the site’s audience', [`<html lang="${b.lang ?? ''}">`, `banner text: ${b.bannerText.slice(0, 300) || '(no banner text captured)'}`]);
  if (acc.policyLinks?.length) add('L16', 'needs human review', 'Compare the cookie/privacy policy with the cookies actually observed', acc.policyLinks.map((p) => `${p.label}: ${p.href}`));
  else add('L16', 'warning', 'No cookie or privacy policy link detected', []);
  return F;
}

// ---------- main ----------
const browser = await chromium.launch({ headless: true, executablePath: chromiumPath() });
const states = [];
for (const kind of ['none', 'reject', 'accept']) {
  process.stderr.write(`crawling ${target} — state: ${kind}\n`);
  states.push(await runState(browser, kind));
}
await browser.close();

const F = findings(states);
const evidence = { tool: 'Check GDPR EU Agent crawler', version: VERSION, target, crawledAt: new Date().toISOString(), locale: LOCALE, blockThirdParty: flag('block-third-party'), states, findings: F };
writeFileSync(join(OUT, 'evidence.json'), JSON.stringify(evidence, null, 2));

const order = { 'presumptive violation': 0, warning: 1, 'needs human review': 2, 'observed fact': 3 };
const md = [
  `# Crawl evidence — ${target}`,
  '',
  `Crawled ${evidence.crawledAt} · locale ${LOCALE} · crawler ${VERSION}${evidence.blockThirdParty ? ' · third-party requests blocked (test mode)' : ''}`,
  '',
  '> Not legal advice. These are observations by an automated crawler. The data controller is responsible for compliance; a qualified person must review every finding.',
  '',
  '| Check | Level | Finding | Evidence |',
  '|---|---|---|---|',
  ...F.sort((a, b) => order[a.level] - order[b.level]).map((f) => `| ${f.id} | ${f.level} | ${f.title} | ${f.evidence.slice(0, 8).join('<br>').replace(/\|/g, '\\|')}${f.evidence.length > 8 ? `<br>… +${f.evidence.length - 8} more` : ''} |`),
  '',
  `Errors: ${states.flatMap((s) => s.errors).join('; ') || 'none'}`,
  `Full evidence: ${join(OUT, 'evidence.json')}`,
].join('\n');
writeFileSync(join(OUT, 'summary.md'), md);
console.log(md);
