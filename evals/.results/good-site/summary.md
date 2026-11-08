# Crawl evidence — http://localhost:8732/

Crawled 2026-11-08T22:24:16.508Z · locale cs-CZ · crawler 0.1.0 · third-party requests blocked (test mode)

> Not legal advice. These are observations by an automated crawler. The data controller is responsible for compliance; a qualified person must review every finding.

| Check | Level | Finding | Evidence |
|---|---|---|---|
| L22 | needs human review | Banner language vs the site’s audience | <html lang="cs"><br>banner text: používáme analytické a marketingové cookies jen s vaším souhlasem. přijmout vše odmítnout vše nastavení |
| L16 | needs human review | Compare the cookie/privacy policy with the cookies actually observed | zásady cookies: http://localhost:8732/cookies.html |
| L7 | observed fact | Accept and reject look equivalent | accept "přijmout vše" vs reject "odmítnout vše" |
| L4 | observed fact | No known trackers observed after "reject all" | clicks: odmítnout vše |
| L5 | observed fact | Trackers seen after "accept all" (calibration: these should be absent before consent and after refusal) | Google Analytics |
| L14 | observed fact | A control to change or withdraw consent is visible after accepting | "nastavení cookies" |

Errors: none
Full evidence: /opt/github/claude_gdpreu_openways/evals/.results/good-site/evidence.json