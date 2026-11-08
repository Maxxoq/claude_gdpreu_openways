# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).
While the version is `0.x`, check rules may still change between minor versions.

## [Unreleased]

## [0.1.0] — 2026-11-08
### Added
- **Agent prompt** (`prompt/gdpr-eu-agent.md`) for any AI. It has three modes (`site`, `code`, `full`), a mandatory responsibility notice, four finding levels, and never calls a site "compliant". It is read-only. Without tools, it asks the user for evidence instead.
- **Check catalogue** (`references/checks.md`): 25 live-site checks (L1–L25) and 11 code checks (S1–S11), ranked P0–P3 by enforcement weight, each with its legal anchor.
- **Country profiles** (`references/countries.md`) for CZ, SK, PL, AT, DE, FR, BE, NL, IE, IT, ES, DK, SE, NO, FI and the UK. Unverified claims are marked [U]. Includes how to weight a missing first-layer "reject all" by country.
- **Crawler** (`plugins/gdpreu/crawler/crawl.mjs`, Playwright):
  - Visits the site in three states: no interaction, "reject all", "accept all".
  - Records cookies, storage, requests, banner controls (14 languages, shadow DOM and iframes), click counts (on the reject path it unticks pre-ticked purposes like a real user), visual parity, pre-ticked toggles, Consent Mode, fingerprinting APIs, and withdrawal and policy links.
  - Writes `summary.md` and `evidence.json`.
- Our own tracker and cookie **signatures** for about 30 vendors and 13 CMPs, with no non-commercial lists bundled.
- **Code scanner** (`plugins/gdpreu/scripts/scan-code.mjs`, no dependencies). Covers tracker tags and SDKs, CMPs, Consent Mode defaults, cookie and storage writes with name classification, fingerprinting, mobile SDKs, dependencies, proxies, and the deprecated TCF API.
- **Claude Code plugin** `gdpreu`: the `/gdpreu:check` skill (editing tools disabled) and the read-only `gdpr-auditor` subagent, plus the `openways-gdpreu` marketplace.
- **Evals**: bad and good fixture sites with 24 deterministic crawler and scanner assertions (run in CI), plus an agent-level suite.
- Project skeleton: README, [DISCLAIMER](DISCLAIMER.md) (not legal advice; the data controller is always responsible), MIT license, openways.ai logo.

[Unreleased]: https://github.com/Maxxoq/claude_gdpreu_openways/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Maxxoq/claude_gdpreu_openways/releases/tag/v0.1.0
