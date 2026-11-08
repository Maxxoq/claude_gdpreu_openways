# Crawl evidence — http://localhost:8731/

Crawled 2026-11-08T22:23:38.610Z · locale cs-CZ · crawler 0.1.0 · third-party requests blocked (test mode)

> Not legal advice. These are observations by an automated crawler. The data controller is responsible for compliance; a qualified person must review every finding.

| Check | Level | Finding | Evidence |
|---|---|---|---|
| L1 | presumptive violation | Tracking cookies set before any consent | _ga (Google Analytics, localhost, 400 days)<br>_fbp (Meta Pixel, localhost, 90 days) |
| L2 | presumptive violation | Tracking identifiers in browser storage before any consent | localStorage _hjSessionUser_123 (Hotjar, http://localhost:8731) |
| L3 | presumptive violation | Requests to trackers before any consent | Meta Pixel: https://www.facebook.com/tr?id=123&ev=PageView |
| L6 | presumptive violation | No "reject all" on the first layer while "accept" is there | accept: "accept all"<br>settings: "settings"<br>reject took 4 click(s): settings → untick marketing → untick statistics → save settings<br>Hard rule in ES, DE (courts), SE, NO, FI; strong expectation in most others; IT: best practice only. |
| L8 | presumptive violation | Pre-ticked non-essential purposes | marketing<br>statistics |
| L4 | presumptive violation | Tracking cookies present after "reject all" | _ga (Google Analytics, localhost)<br>_fbp (Meta Pixel, localhost) |
| L4 | presumptive violation | Tracking storage present after "reject all" | _hjSessionUser_123 (Hotjar) |
| L4 | presumptive violation | Tracker requests after "reject all" | Meta Pixel: https://www.facebook.com/tr?id=123&ev=PageView |
| L14 | presumptive violation | No visible way to change or withdraw consent after accepting (footer link or floating icon not detected) | Withdrawal must be as easy as giving consent (GDPR art. 7(3)). Confirm manually: CMP icons are sometimes images without text. |
| L12 | warning | Google tags present but no Consent Mode default was found in dataLayer | Google requires Consent Mode v2 for EEA traffic (contractual, not EU law). |
| L19 | warning | Fingerprinting-capable APIs called before consent (can also be legitimate, e.g. image editing) | canvas.toDataURL by http://localhost:8731/ |
| L16 | warning | No cookie or privacy policy link detected |  |
| HR | needs human review | Cookies the crawler could not classify — decide whether each is strictly necessary | shop_ab_test (localhost, 30 days, first-party)<br>consent (localhost, 0 days, first-party) |
| L22 | needs human review | Banner language vs the site’s audience | <html lang="cs"><br>banner text: we use cookies to improve your experience. accept all settings |
| L5 | observed fact | Trackers seen after "accept all" (calibration: these should be absent before consent and after refusal) | Meta Pixel<br>Google Analytics<br>Hotjar |

Errors: none
Full evidence: /opt/github/claude_gdpreu_openways/evals/.results/bad-site/evidence.json