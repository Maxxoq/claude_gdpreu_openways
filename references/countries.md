# Country profiles — Check GDPR EU Agent

Research state: 8 November 2026. **[U] = unverified** (single secondary source, background knowledge, or sources conflict): mention it only as uncertain, and never base a "presumptive violation" on a [U] rule alone. National statute wording was not re-read from official databases; treat section numbers as pointers.

Every jurisdiction requires **prior opt-in consent** for non-essential storage/access and follows the EDPB Taskforce positions in practice (no pre-ticked boxes, no nudging, refusal must work). They differ on five points: first-layer reject, analytics exemption, cookie walls / pay-or-consent, who enforces, and fine levels.

Choose the countries from the user, or infer them from the site (TLD, `<html lang>`, currency, shipping countries, imprint). When several apply, report the strictest rule and name the country.

| Code | Cookie rule (since) | Enforcer: cookie rule / GDPR | First-layer "reject all" | Analytics exemption | Cookie wall / pay-or-consent | Notes for the report |
|---|---|---|---|---|---|---|
| **CZ** | § 89(3) Act 127/2005 Sb.; opt-in since 1 Jan 2022 | ÚOOÚ (via GDPR) | Same layer as accept, ideally first; size/colour matter (ÚOOÚ 2024) | None | No position found | ÚOOÚ fines (CZK 4.4m in 2023). Its six violation types: no consent, defective consent, poor or **English-only information**, impossible withdrawal, hidden reject, banner ignoring choices. Footer withdrawal link expected. A site with only technical cookies needs no banner but must still inform. 12-month validity / 6-month re-ask [U] |
| **SK** | § 109(8) Act 452/2021 Z. z.; since 1 Feb 2022 | RÚ (teleoff.gov.sk) / ÚOOÚ SR | Strongly recommended, equal prominence (RÚ 2025) | None found | No position found | >105 inspections, >€80k fines; RÚ runs its own "Cookies Auditor". Fine ceiling 5% vs 10% [U] |
| **PL** | Art. 399 PKE (Dz.U. 2024 poz. 1221); since 10 Nov 2024 | UKE / UODO | No PL-specific rule found | None found | EDPB view cited [U] | No public art. 399 fine known. Browser-settings consent disputed |
| **AT** | § 165(3) TKG 2021 | Fernmeldebehörden / DSB | Reject no more clicks, equally prominent (DSB FAQ) | None | Conditionally allowed (DSB 29 Mar 2023, not final) | Google Analytics transfer unlawful (DSB 2021, BVwG 2023) |
| **DE** | § 25 TDDDG (TTDSG renamed May 2024); EinwV (PIMS) since 1 Apr 2025 | State DPAs, BfDI; also competitors/consumer groups (UWG) | **Required** where accept-all is on the first layer (OLG Köln 19 Jan 2024, 6 U 80/23; VG Hannover 19 Mar 2025, 10 A 5385/22) | None | Pur-Abo allowed under conditions (DSK 22 Mar 2023) | "Akzeptieren & Schließen X" misleading (OLG Köln). Private lawsuits are a real risk |
| **FR** | Art. 82 Loi Informatique et Libertés | CNIL (outside one-stop-shop) | Refusing must be as easy as accepting — repeatedly fined | **Yes**: strictly limited audience measurement, no reuse by provider (CNIL self-assessment tool, updated 4 Jul 2025). Default Google Analytics does **not** qualify | Case by case | Biggest fines in Europe: Google €150m + Facebook €60m (2022), Microsoft €60m (2022), TikTok €5m (2023), Yahoo €10m (2024), **Google €325m, Shein €150m (Sept 2025)**, Condé Nast €750k, Amex €1.5m (Nov 2025) |
| **BE** | Art. 10/2 Law of 30 Jul 2018 since 2022 [U] | APD/GBA | Strongly recommended | None found | Wall without alternative non-compliant [U] | APD cookie checklist (20 Oct 2023). IAB Europe TCF €250k upheld (Market Court 14 May 2025) |
| **NL** | Art. 11.7a Telecommunicatiewet | ACM / AP | Expected | None found | Wall without alternative non-compliant [U] | AP warned >200 organisations (2025), plans automated scanning of 10,000 sites. Kruidvat €600k (2024), reportedly reduced [U] |
| **IE** | S.I. 336/2011 reg. 5 | DPC | No nudging, no pre-ticked (2020 guidance) | None | Not found | No cookie fines 2022–2026 found |
| **IT** | Art. 122 Codice privacy; Garante guidelines 10 Jun 2021 (from 10 Jan 2022) | Garante | **Not mandatory** — "not best practice" (Provv. 327, 4 Jun 2025); explaining what closing the banner does **is** required | Masked-IP, non-crossed analytics treated as technical [U] | Unlawful without equivalent alternative; pay-or-OK consultation 2025 | Closing with "X" = reject; 6-month re-ask rule [U]. Mostly reprimands |
| **ES** | Art. 22.2 LSSI | AEPD | **Mandatory since 11 Jan 2024**: same layer, level and format | None | Paid alternative acceptable if explained | Regular small fines (Iberia €30k; Wallapop, El Debate €3k in 2025). 24-month validity [U] |
| **DK** | BEK 1148/2011 | Digitaliseringsstyrelsen / Datatilsynet | Reject as easy as accept (eb.dk 2022) | None — "statistics are not necessary" | Pay-or-track allowed, but **the paid tier must not track, statistics included** | GA in default setup unlawful (2022). Joint guide 15 May 2025. Fines via courts |
| **SE** | LEK (2022:482) ch. 9 § 28 | PTS / IMY | Expected; "Accept" + "Manage" alone insufficient | None | Not found | IMY: Tele2 SEK 12m, CDON SEK 300k (GA, 2023). 2025 reprimands: highlighted accept is misleading; withdrawal ≈ same clicks as consent |
| **NO** (EEA) | Ekomloven § 3-15; since 1 Jan 2025 | Nkom / Datatilsynet | Reject no more cumbersome, not hidden | Not stated | **Cookie walls banned** | Browser-settings consent ended 1 Jan 2025 |
| **FI** | § 205 Act 917/2014 | Traficom (NCSC-FI) / Ombudsman | Ordered for Sanoma, Telia, A-lehdet [U] | None; GA only after consent | Not found | 16 NCSC-FI decisions 2022–2025 (orders, no fines listed) |
| **UK** (non-EU) | PECR reg. 6 + Sch. A1 (DUAA 2025 s.112); in force 5 Feb 2026 | ICO | Equally easy reject expected | **Yes, opt-out**: first-party statistics and functionality, with clear info and a free way to object; no sharing beyond improvement | Consent-or-pay can be lawful (ICO Jan 2025) | Never apply UK exemptions to EU traffic. Fine cap £17.5m / 4% [U] |

## How to weigh L6 (first-layer reject) by country

- **Presumptive violation:** ES, DE, SE, NO, FI, and FR when refusing takes more clicks than accepting.
- **Presumptive violation (regulator expectation):** CZ, SK, AT, BE, NL, DK, IE, PL.
- **Warning only:** IT (but the banner must explain what closing it does).
- **UK:** warning for consent-based cookies; analytics may use opt-out (L23).
