// Check GDPR EU Agent — tracker and cookie signatures.
// Written by openways.ai from vendors' public documentation; MIT like the rest of the project.
// Deliberately small and curated: it names the trackers regulators fine for most often.
// A match is a hint for a human reviewer, never a legal classification.

/** @typedef {{vendor:string, category:'analytics'|'advertising'|'session-replay'|'social'|'tag-manager'|'fingerprinting'|'cmp', hosts:string[], paths?:RegExp[], cookies?:RegExp[], storage?:RegExp[]}} Signature */

/** @type {Signature[]} */
export const TRACKERS = [
  { vendor: 'Google Analytics', category: 'analytics',
    hosts: ['google-analytics.com', 'analytics.google.com'],
    paths: [/\/g\/collect/, /\/collect\?/, /\/j\/collect/],
    cookies: [/^_ga($|_)/, /^_gid$/, /^_gat/, /^__utm[abcz]$/] },
  { vendor: 'Google Tag Manager / gtag.js', category: 'tag-manager',
    hosts: ['googletagmanager.com'] },
  { vendor: 'Google Ads / DoubleClick', category: 'advertising',
    hosts: ['doubleclick.net', 'googleadservices.com', 'googlesyndication.com', 'adservice.google.com'],
    paths: [/\/pagead\//, /\/ccm\/collect/],
    cookies: [/^_gcl_(au|aw|dc|gb)$/, /^IDE$/, /^test_cookie$/, /^DSID$/, /^__gads$/, /^__gpi$/] },
  { vendor: 'Meta Pixel', category: 'advertising',
    hosts: ['connect.facebook.net', 'facebook.com', 'facebook.net'],
    paths: [/\/tr\/?\?/, /fbevents\.js/],
    cookies: [/^_fbp$/, /^_fbc$/, /^fr$/] },
  { vendor: 'TikTok Pixel', category: 'advertising',
    hosts: ['analytics.tiktok.com', 'business-api.tiktok.com'],
    cookies: [/^_ttp$/, /^_tt_enable_cookie$/, /^ttcsid/] },
  { vendor: 'LinkedIn Insight', category: 'advertising',
    hosts: ['snap.licdn.com', 'px.ads.linkedin.com', 'ads.linkedin.com'],
    cookies: [/^li_sugr$/, /^bcookie$/, /^lidc$/, /^UserMatchHistory$/, /^AnalyticsSyncHistory$/, /^li_fat_id$/] },
  { vendor: 'X (Twitter) Pixel', category: 'advertising',
    hosts: ['static.ads-twitter.com', 'analytics.twitter.com', 't.co'],
    cookies: [/^personalization_id$/, /^muc_ads$/] },
  { vendor: 'Pinterest Tag', category: 'advertising',
    hosts: ['s.pinimg.com', 'ct.pinterest.com'], cookies: [/^_pin_unauth$/, /^_pinterest_ct/] },
  { vendor: 'Snap Pixel', category: 'advertising', hosts: ['sc-static.net', 'tr.snapchat.com'], cookies: [/^_scid/] },
  { vendor: 'Microsoft Advertising (UET)', category: 'advertising',
    hosts: ['bat.bing.com'], cookies: [/^_uet(sid|vid)$/, /^MUID$/] },
  { vendor: 'Microsoft Clarity', category: 'session-replay',
    hosts: ['clarity.ms'], cookies: [/^_clck$/, /^_clsk$/, /^CLID$/] },
  { vendor: 'Hotjar', category: 'session-replay',
    hosts: ['hotjar.com', 'hotjar.io'], cookies: [/^_hj/], storage: [/^_hj/] },
  { vendor: 'Mouseflow', category: 'session-replay', hosts: ['mouseflow.com'], cookies: [/^mf_/] },
  { vendor: 'FullStory', category: 'session-replay', hosts: ['fullstory.com'], cookies: [/^fs_uid$/] },
  { vendor: 'Smartlook', category: 'session-replay', hosts: ['smartlook.com', 'smartlook.cloud'] },
  { vendor: 'Yandex Metrica', category: 'analytics', hosts: ['mc.yandex.ru', 'mc.yandex.com'], cookies: [/^_ym_/] },
  { vendor: 'Adobe Analytics', category: 'analytics', hosts: ['omtrdc.net', '2o7.net', 'demdex.net'], cookies: [/^s_(cc|sq|vi|fid)$/, /^AMCV_/, /^demdex$/] },
  { vendor: 'Mixpanel', category: 'analytics', hosts: ['mixpanel.com', 'mxpnl.com'], cookies: [/^mp_.*_mixpanel$/], storage: [/^mp_/] },
  { vendor: 'Amplitude', category: 'analytics', hosts: ['amplitude.com'], cookies: [/^AMP_/], storage: [/^AMP_/] },
  { vendor: 'Segment', category: 'analytics', hosts: ['segment.com', 'segment.io'], cookies: [/^ajs_(anonymous_id|user_id)$/], storage: [/^ajs_/] },
  { vendor: 'PostHog', category: 'analytics', hosts: ['posthog.com', 'i.posthog.com'], cookies: [/^ph_.*_posthog$/], storage: [/^ph_/] },
  { vendor: 'HubSpot', category: 'analytics', hosts: ['hs-scripts.com', 'hs-analytics.net', 'hubspot.com', 'hsforms.net'], cookies: [/^__hs(tc|sc|fc)$/, /^hubspotutk$/] },
  { vendor: 'Criteo', category: 'advertising', hosts: ['criteo.com', 'criteo.net'], cookies: [/^cto_/] },
  { vendor: 'Taboola', category: 'advertising', hosts: ['taboola.com'], cookies: [/^t_gid$/] },
  { vendor: 'Outbrain', category: 'advertising', hosts: ['outbrain.com'] },
  { vendor: 'Seznam Sklik / retargeting', category: 'advertising', hosts: ['c.seznam.cz', 'h.seznam.cz', 'ssp.seznam.cz'], cookies: [/^sid$/, /^sznaiid$/] },
  { vendor: 'Heureka conversion', category: 'advertising', hosts: ['im9.cz', 'heureka.cz'] },
  { vendor: 'Gemius', category: 'analytics', hosts: ['gemius.pl', 'hit.gemius.pl'], cookies: [/^Gdyn$/, /^Gtest$/] },
  { vendor: 'YouTube embed', category: 'social', hosts: ['youtube.com', 'ytimg.com'], cookies: [/^VISITOR_INFO1_LIVE$/, /^YSC$/, /^VISITOR_PRIVACY_METADATA$/] },
  { vendor: 'Vimeo embed', category: 'social', hosts: ['vimeo.com', 'vimeocdn.com'], cookies: [/^vuid$/] },
  { vendor: 'FingerprintJS', category: 'fingerprinting', hosts: ['fpjs.io', 'fptls.com', 'fpcdn.io', 'openfpcdn.io'] },
];

/** Consent management platforms. Their own consent-state cookie is normally allowed. */
export const CMPS = [
  { vendor: 'OneTrust', hosts: ['cookielaw.org', 'onetrust.com'], cookies: [/^OptanonConsent$/, /^OptanonAlertBoxClosed$/, /^eupubconsent-v2$/] },
  { vendor: 'Cookiebot', hosts: ['cookiebot.com', 'cookiebot.eu'], cookies: [/^CookieConsent$/] },
  { vendor: 'Usercentrics', hosts: ['usercentrics.eu', 'usercentrics.com'], storage: [/^uc_/] },
  { vendor: 'Didomi', hosts: ['didomi.io', 'privacy-center.org'], cookies: [/^didomi_token$/, /^euconsent-v2$/] },
  { vendor: 'iubenda', hosts: ['iubenda.com'], cookies: [/^_iub_cs-/] },
  { vendor: 'Complianz', hosts: [], cookies: [/^cmplz_/] },
  { vendor: 'CookieYes', hosts: ['cookieyes.com'], cookies: [/^cookieyes-consent$/] },
  { vendor: 'Klaro', hosts: [], cookies: [/^klaro$/] },
  { vendor: 'orestbida CookieConsent', hosts: [], cookies: [/^cc_cookie$/] },
  { vendor: 'Osano', hosts: ['osano.com'], cookies: [/^osano_consentmanager/] },
  { vendor: 'Termly', hosts: ['termly.io'] },
  { vendor: 'Quantcast Choice', hosts: ['quantcast.mgr.consensu.org'], cookies: [/^euconsent-v2$/, /^addtl_consent$/] },
  { vendor: 'TCF consent string', hosts: [], cookies: [/^euconsent(-v2)?$/, /^addtl_consent$/] },
];

/** Names that usually indicate a strictly necessary cookie. Still a hint only. */
export const LIKELY_ESSENTIAL = [
  /^(PHPSESSID|JSESSIONID|ASP\.NET_SessionId|ASPSESSIONID.*|sessionid|session|connect\.sid|laravel_session|_session_id|SESS[0-9a-f]+)$/i,
  /^(csrftoken|XSRF-TOKEN|_csrf|csrf_token|__RequestVerificationToken.*|__Host-.*csrf.*)$/i,
  /^(AWSALB|AWSALBCORS|AWSELB|__cf_bm|cf_clearance|__cfruid|BIGipServer.*|SERVERID|ARRAffinity.*|incap_ses_.*|visid_incap_.*)$/i,
  /^(wordpress_logged_in_.*|wordpress_sec_.*|wp-settings-.*|woocommerce_cart_hash|woocommerce_items_in_cart|wp_woocommerce_session_.*)$/i,
  /^(lang|language|locale|currency|cart|basket)$/i,
];

function hostMatches(host, list) {
  host = (host || '').toLowerCase();
  return list.some((h) => host === h || host.endsWith('.' + h));
}

/** Classify a request URL. Returns the matching signature or null. */
export function classifyRequest(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  for (const s of TRACKERS) if (hostMatches(u.hostname, s.hosts)) return s;
  for (const c of CMPS) if (hostMatches(u.hostname, c.hosts)) return { ...c, category: 'cmp' };
  // GA4 hits sent through a first-party domain (server-side tagging / proxy): same duty to ask for consent.
  if (/\/g\/collect$/.test(u.pathname) && /^G-/.test(u.searchParams.get('tid') || '')) {
    return { vendor: 'Google Analytics (first-party / proxied endpoint)', category: 'analytics', hosts: [] };
  }
  return null;
}

/** Classify a cookie or storage key by name (and domain for cookies). */
export function classifyName(name, kind = 'cookie') {
  for (const s of TRACKERS) {
    const pats = kind === 'cookie' ? s.cookies : (s.storage || s.cookies);
    if (pats && pats.some((p) => p.test(name))) return { vendor: s.vendor, category: s.category };
  }
  for (const c of CMPS) {
    const pats = kind === 'cookie' ? c.cookies : (c.storage || c.cookies);
    if (pats && pats.some((p) => p.test(name))) return { vendor: c.vendor, category: 'cmp' };
  }
  if (kind === 'cookie' && LIKELY_ESSENTIAL.some((p) => p.test(name))) return { vendor: null, category: 'likely-essential' };
  return { vendor: null, category: 'unknown' };
}
