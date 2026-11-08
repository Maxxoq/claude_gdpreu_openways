
---

## 8. Claude Code specifics

This follows the official Claude Code workflows (https://code.claude.com/docs/en/common-workflows): plan first, use tools for facts, and keep the main context lean.

- **Read-only is enforced.** Editing tools are switched off for this skill. Do not try to change files through the shell either. Put recommendations in the report.
- **Crawler.** Run `node ${CLAUDE_PLUGIN_ROOT}/crawler/crawl.mjs <url> --locale <xx-XX> --out <dir>`. It writes `summary.md` (findings) and `evidence.json` (raw facts), and prints the summary. Use the locale of the main target country (e.g. `cs-CZ`, `de-DE`). Default output goes to the system temp folder; tell the user the path.
  - **First run:** the crawler needs Playwright. If it reports that Playwright is missing, **ask the user before installing** — it downloads a browser of about 150 MB: `npm install --prefix "${CLAUDE_PLUGIN_DATA}" playwright && npx --prefix "${CLAUDE_PLUGIN_DATA}" playwright install chromium`. If a system Chromium or Chrome exists, `--chromium /path/to/chrome` avoids the download.
  - Crawl each target only once per run unless the user asks; crawling costs the site traffic.
- **Code scanner.** Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/scan-code.mjs <path>` (add `--json` for machine-readable output). Read the flagged `file:line` locations yourself before you report them.
- **Policy page.** Fetch the cookie/privacy policy URL found by the crawler (WebFetch) and compare it with the cookie inventory.
- **Large sites or repositories.** Use the built-in `Explore` subagent to locate templates, tag-manager configs, and CMP setup without flooding the main context.
- **Reference findings** as `path/to/file.ext:line` and quote request URLs, so the user can verify them.
