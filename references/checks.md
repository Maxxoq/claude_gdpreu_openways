# Check catalogue — Check GDPR EU Agent

Research state: 8 November 2026. Priorities follow enforcement weight: **P0** = facts regulators have repeatedly fined for, decidable by a browser; **P1** = settled law, heuristic detection; **P2** = country-weighted or needs confirmation; **P3** = informational or forward-looking.

Allowed output levels — use exactly these words:
- **observed fact** — what the crawler or scanner saw, with evidence.
- **presumptive violation** — the evidence matches conduct regulators treat as a breach. A human still decides.
- **warning** — a likely problem, or a heuristic that may be wrong.
- **needs human review** — automation cannot decide; give the evidence.

Never use "compliant", "GDPR-compliant", "passes GDPR", "legal" or similar. A clean result means "no problems found by these checks", nothing more.

## Legal anchors (EU level)

- **Art. 5(3) ePrivacy Directive** (2002/58/EC as amended by 2009/136/EC): storing or reading anything on a device needs prior consent unless strictly necessary for a service the user explicitly requested, or for transmitting a communication. It applies whether or not the data is personal (CJEU **Planet49**, C-673/17, 1 Oct 2019).
- **GDPR consent standard** (arts. 4(11), 7, recital 32): freely given, specific, informed, unambiguous, a clear affirmative act, demonstrable, and as easy to withdraw as to give. Pre-ticked boxes, silence and scrolling are not consent.
- **EDPB Guidelines 2/2023** on the technical scope of art. 5(3) (final 7 Oct 2024): also pixels, link decoration and URL tracking, local storage, IP-only tracking, fingerprinting, IoT. The technique does not matter.
- **EDPB Cookie Banner Taskforce report** (Jan 2023): no reject option on the first layer, pre-ticked boxes, deceptive design and colours, legitimate interest for cookies, inaccurately classified "essential" cookies, and missing withdrawal are the common violations.
- **EDPB Guidelines 03/2022** on deceptive design patterns (final 14 Feb 2023).
- **Reform is not law yet**: the ePrivacy Regulation was withdrawn (2025). The Digital Omnibus (COM(2025) 837) is still a proposal. Never apply its rules as if in force; at most flag them as "upcoming".

## Live-site checks (crawler: three fresh profiles — no interaction, "reject all", "accept all")

| ID | Pri | Check | Level when it fails | Anchor |
|---|---|---|---|---|
| L1 | P0 | Non-essential cookies before any interaction | presumptive violation | Art. 5(3); Planet49; Taskforce; CNIL fines |
| L2 | P0 | Tracking identifiers in localStorage / sessionStorage before consent | presumptive violation | EDPB 2/2023 |
| L3 | P0 | Requests to trackers (pixels, analytics hits) before consent | presumptive violation | EDPB 2/2023 |
| L4 | P0 | Trackers, cookies or storage still present after "reject all" | presumptive violation | CNIL Yahoo 2024, Shein 2025, Amex 2025; AEPD 2025 |
| L5 | P0 | Trackers after "accept all" (calibration) | observed fact | — |
| L14 | P0 | A persistent way to change/withdraw consent (footer link or icon) that is as easy as consenting | presumptive violation if missing | GDPR art. 7(3); ÚOOÚ; IMY 2025; CNIL Amex |
| L6 | P1 | "Reject all" on the first layer when "accept all" is there; click counts | presumptive violation (country-weighted, see countries.md) | Taskforce; ES, DE, SE, NO, FI hard; IT best practice |
| L7 | P1 | Visual parity of accept vs reject (size, colour, contrast, link vs button) | warning (no regulator gives numeric thresholds) | Taskforce; EDPB 03/2022; IMY 2025; AT DSB |
| L8 | P1 | Pre-ticked non-essential purposes on any layer | presumptive violation | Planet49; Orange Romania C-61/19 |
| L16 | P1 | Cookie policy vs reality: declared cookies, purposes, lifetimes, third parties, transfers vs observed | needs human review / warning | GDPR art. 13; Planet49; CNIL Shein |
| L19 | P1 | Fingerprinting APIs (canvas, WebGL unmasked renderer, audio) before consent | warning | EDPB 2/2023 |
| L22 | P1 | Banner and policy in the language of the audience | warning (hard in CZ) | ÚOOÚ 2023 |
| L9 | P2 | Granular purposes (and vendors for TCF) | warning | GDPR arts. 4(11), 7 |
| L10 | P2 | TCF: legitimate interest used for purposes 3–6, or LI left on after "reject all" | presumptive violation | TCF v2.2; Taskforce |
| L11 | P2 | TC string matches the user's choice | presumptive violation | IAB Europe C-604/22 |
| L12 | P2 | Consent Mode v2: `consent default` denies all four keys before any config/event | warning (Google contract, not EU law) | Google EU User Consent Policy |
| L15 | P2 | Cookie wall / pay-or-consent | needs human review | EDPB Opinion 08/2024; national positions differ |
| L20 | P2 | Server-side tagging / CNAME proxies to trackers | needs human review | EDPB 2/2023 |
| L23 | P2 | UK only: working opt-out for analytics/functionality storage | UK-only finding | PECR Sch. A1 paras 5–6 (since 5 Feb 2026) |
| L13 | P3 | Advanced Consent Mode cookieless pings while denied | needs human review, never auto-fail | no DPA decision |
| L17 | P3 | Proof of consent (consent cookie, CMP log endpoint) | needs human review | GDPR art. 7(1) |
| L18 | P3 | Global Privacy Control honoured | observed fact (informational, no binding EU basis) | W3C draft |
| L21 | P3 | Cookie security attributes (Secure, HttpOnly, SameSite) | warning | GDPR art. 32 |
| L24 | P3 | US recipients and EU-US Data Privacy Framework status | needs human review | Decision 2023/1795; Latombe T-553/23 (appeal pending) |
| L25 | P3 | Future-law flags (Digital Omnibus) | "upcoming, not in force" | Council mandate 21 Oct 2026 [U] |

## Codebase checks (scanner; always "confirm on the live site")

| ID | Pri | Check |
|---|---|---|
| S1 | P1 | Tracker tag or SDK included — is it gated by consent? |
| S2 | P1 | CMP present, and loaded before trackers |
| S3 | P1 | Consent Mode default: all four keys `denied` (at least EEA), before `config`/`event` |
| S4 | P1 | Cookie writes — classify each name: necessary or not |
| S5 | P2 | localStorage / sessionStorage / IndexedDB writes |
| S6 | P2 | Fingerprinting-capable APIs |
| S7 | P2 | Mobile analytics / ad SDKs — collection off by default until consent |
| S8 | P2 | Tracking dependencies in manifests |
| S9 | P2 | Privacy/cookie policy files vs what the code sets |
| S10 | P2 | Server-side tagging and proxies |
| S11 | P3 | Deprecated `__tcfapi('getTCData')` |

## Always for a human

Strict-necessity classification of each cookie · GDPR art. 6 basis and legitimate-interest balancing · analytics exemptions (FR CNIL, UK) · cookie walls and pay-or-consent · international transfers and transfer impact assessments · DPIA need · joint controllership and contracts · proof of consent logs · clarity of wording · Advanced Consent Mode, server-side tagging, CNAME proxies · mobile app runtime behaviour.

## Reliability limits to state in every report

Results depend on crawl location, time, language and A/B-tested banners. Bot detection can change behaviour. Banner clicking is heuristic. Tracker lists cause false positives and negatives. Static code findings cannot see tag-manager or CMS configuration. Crawling is itself processing of data: only crawl sites you are allowed to test.
