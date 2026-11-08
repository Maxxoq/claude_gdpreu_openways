<p align="center">
  <a href="https://openways.ai">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/openways-logo-dark.svg">
      <img src="assets/openways-logo-light.svg" alt="openways.ai" width="320">
    </picture>
  </a>
</p>

# Check GDPR EU Agent — by openways.ai

> [!WARNING]
> **Not legal advice. A human is always responsible for the data.**
> This tool helps you find possible problems. It can be wrong or out of date, and a clean result does not mean you comply. The data controller (you, your company, or your client) is solely responsible for compliance. The authors accept no liability. Read the full [DISCLAIMER](DISCLAIMER.md) before use.

A free, open-source agent for Claude Code and other AI assistants. It checks **websites and codebases** for problems with the EU rules on **cookies, tracking and consent**: ePrivacy art. 5(3) together with the GDPR consent standard. It covers **16 jurisdictions**: CZ, SK, PL, AT, DE, FR, BE, NL, IE, IT, ES, DK, SE, NO, FI and the UK.

It collects **evidence**, compares it with what regulators have actually fined for between 2022 and 2026, and hands every legal judgment to a human. It never tells you that a site is "compliant".

## What it checks

**On a live site**, the crawler opens it in three fresh browser profiles: without clicking anything, after "reject all", and after "accept all". It looks for:
- tracking cookies, storage, and pixels **before consent** (L1–L3),
- trackers that **survive "reject all"** (L4),
- a missing **"reject all" on the first layer**, with click counts and weighting by country (L6),
- **visual nudging**, where the accept button is bigger or more colourful than reject (L7),
- **pre-ticked** purposes (L8),
- **Google Consent Mode v2** defaults (L12),
- a **withdrawal** link or icon (L14),
- a **cookie policy** to compare with the cookies actually observed (L16),
- **fingerprinting** APIs (L19),
- cookie security attributes (L21),
- banner language (L22),
- and **unknown cookies**, which go to human review.

**In code**, a static scan finds:
- tracker tags and SDKs, and whether consent logic is nearby,
- the CMP setup,
- the Consent Mode defaults,
- every cookie and storage write, with each cookie name classified,
- fingerprinting APIs,
- mobile SDKs,
- tracking dependencies,
- proxies and server-side tagging.

**It always hands these to a human:** whether each cookie is strictly necessary, legal basis and legitimate interest, analytics exemptions (FR, UK), cookie walls and pay-or-consent, international transfers, DPIA, contracts, and proof of consent.

Findings use only four levels: **observed fact**, **presumptive violation**, **warning**, and **needs human review**. Every finding comes with evidence: a cookie name, domain, and lifetime; a request URL; or a `file:line`.

## Install in Claude Code (plugin)

```bash
claude plugin marketplace add Maxxoq/claude_gdpreu_openways
claude plugin install gdpreu@openways-gdpreu
```

Then, inside Claude Code:

```text
/gdpreu:check https://www.example.cz CZ          # live site, Czech rules
/gdpreu:check https://shop.example.de DE,AT      # several target countries
/gdpreu:check .                                  # this codebase
/gdpreu:check https://www.example.com ./web      # site + its code, linked together
```

The plugin also adds a read-only **`gdpr-auditor` subagent** that Claude can delegate to.

**First run:** the crawler needs [Playwright](https://playwright.dev). The agent asks before it installs Playwright and a Chromium browser (about 150 MB) into the plugin's data folder. If you already have Chrome or Chromium, it can use that instead (`--chromium /path/to/chrome`).

**Only test sites you own or are authorised to audit.** Crawling a site is itself processing of data.

## Use the tools directly

```bash
# Live site — three-state crawl, writes summary.md + evidence.json
node plugins/gdpreu/crawler/crawl.mjs https://www.example.cz --locale cs-CZ --out ./evidence

# Codebase — static scan
node plugins/gdpreu/scripts/scan-code.mjs ./my-web-app
```

## Use with other AI tools

Give the assistant [`prompt/gdpr-eu-agent.md`](prompt/gdpr-eu-agent.md) together with [`references/checks.md`](references/checks.md) and [`references/countries.md`](references/countries.md). If the assistant cannot run a browser, the prompt tells it to ask you for evidence instead of guessing: the cookie list before any click, after "reject all", and after "accept all"; screenshots; and the policy text.

## How it was built

The checks come from a deep research pass on EU and national cookie rules for 2022–2026:
- EU level: ePrivacy art. 5(3), the GDPR, EDPB Guidelines 2/2023 and 03/2022, the EDPB Cookie Banner Taskforce, CJEU case law, and the Digital Omnibus proposal.
- National rules and enforcement in 16 jurisdictions.
- Existing open-source tooling, such as the EDPS Website Evidence Collector and the EDPB Website Auditing Tool.

Claims we could not verify against a primary source are marked **[U]** in [`references/countries.md`](references/countries.md). The agent never bases a violation on a [U] rule alone. Research state: **8 November 2026**. Rules change, so check the dates.

The tracker and cookie signatures in `crawler/signatures.mjs` are our own, written from vendors' public documentation. We deliberately do not bundle tracker lists under non-commercial licences.

## Evals

| Suite | What it checks | Cost |
|---|---|---|
| `./evals/run.sh crawler` | The crawler and scanner on two fixture sites. A "bad" shop has trackers before consent, no reject button, pre-ticked purposes, fingerprinting, and no withdrawal link. A "good" shop gates everything and has an equivalent reject button and a withdrawal link. 24 assertions. | free, runs in CI |
| `./evals/run.sh agent` | The full `/gdpreu:check` skill on both fixtures. The report must open with the notice, name the controller, find the problems, and never claim compliance. | uses your Claude plan |

## Repository layout

```text
prompt/            gdpr-eu-agent.md (the agent, for any AI) · claude-code-addendum.md
references/        checks.md (check catalogue) · countries.md (16 country profiles)
plugins/gdpreu/    Claude Code plugin: skills/check, agents/gdpr-auditor (generated), crawler/, scripts/scan-code.mjs
evals/             fixture sites, expectations, runner
scripts/build.sh   regenerates the skill and agent from prompt/ + references/
```

## Contributing

Corrections to country rules are especially welcome. Please include a link to the primary source (statute, regulator decision, or court ruling) and its date. Edit `prompt/` or `references/`, run `./scripts/build.sh`, and add a line to [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE). Free for personal and commercial use, with **no warranty**. See the [DISCLAIMER](DISCLAIMER.md).

---

### 🇨🇿 Česky

Bezplatný open-source agent, který kontroluje **weby a kód** z hlediska pravidel EU pro **cookies, sledování a souhlas** (ePrivacy a GDPR) v 16 zemích, včetně ČR a Slovenska. Web otevře třikrát: bez kliknutí, po „Odmítnout vše“ a po „Přijmout vše“. U každého zjištění uvede důkaz a právní posouzení vždy nechá na člověku.

**Upozornění:** nejde o právní poradenství. Za data a soulad s GDPR vždy odpovídá správce údajů, tedy člověk. Autoři nenesou žádnou odpovědnost. Čistý výsledek neznamená, že jste v souladu s předpisy. Podrobnosti najdete v [DISCLAIMER.md](DISCLAIMER.md).

Instalace: `claude plugin marketplace add Maxxoq/claude_gdpreu_openways` a pak `claude plugin install gdpreu@openways-gdpreu`. Použití: `/gdpreu:check https://www.vas-web.cz CZ`.
