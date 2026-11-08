#!/usr/bin/env bash
# Evals for the Check GDPR EU Agent.
#   ./evals/run.sh crawler          # deterministic crawler checks on the fixture sites (no AI, free; runs in CI)
#   ./evals/run.sh agent            # full skill run via `claude -p` on both fixtures (uses your Claude plan/credits)
# Needs Playwright: set GDPREU_DEPS to the folder where it is installed, and optionally GDPREU_CHROMIUM.
set -euo pipefail
EVALS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$EVALS/.."
OUT="${GDPREU_EVAL_OUT:-$EVALS/.results}"; mkdir -p "$OUT"
CHROME_ARGS=(); [[ -n "${GDPREU_CHROMIUM:-}" ]] && CHROME_ARGS=(--chromium "$GDPREU_CHROMIUM")

PIDS=()
serve() { python3 -m http.server "$2" -d "$EVALS/fixtures/$1" >/dev/null 2>&1 & PIDS+=($!); }
cleanup() { for p in "${PIDS[@]:-}"; do kill "$p" 2>/dev/null || true; done; }
trap cleanup EXIT
BAD_PORT=${GDPREU_BAD_PORT:-8711}; GOOD_PORT=${GDPREU_GOOD_PORT:-8712}
serve bad-site "$BAD_PORT"; serve good-site "$GOOD_PORT"; sleep 1

status=0
case "${1:-crawler}" in
  crawler)
    for s in "bad-site $BAD_PORT" "good-site $GOOD_PORT"; do
      set -- $s
      echo "== crawler: $1"
      node "$ROOT/plugins/gdpreu/crawler/crawl.mjs" "http://localhost:$2/" --out "$OUT/$1" --locale cs-CZ --block-third-party "${CHROME_ARGS[@]}" >/dev/null 2>"$OUT/$1.stderr" || { echo "  FAIL  crawler crashed"; cat "$OUT/$1.stderr"; status=1; continue; }
      node "$EVALS/expect.mjs" "$1" "$OUT/$1/evidence.json" || status=1
    done
    echo "== code scanner"
    out=$(node "$ROOT/plugins/gdpreu/scripts/scan-code.mjs" "$EVALS/fixtures/bad-site" --json)
    for id in S1 S4 S5 S6; do
      if grep -q "\"id\": \"$id\"" <<<"$out"; then echo "  PASS  bad-site has $id"; else echo "  FAIL  bad-site missing $id"; status=1; fi
    done
    good=$(node "$ROOT/plugins/gdpreu/scripts/scan-code.mjs" "$EVALS/fixtures/good-site" --json)
    if grep -q 'all four v2 keys default to \\"denied\\"' <<<"$good"; then echo "  PASS  good-site Consent Mode defaults denied"; else echo "  FAIL  good-site Consent Mode default not recognised"; status=1; fi
    ;;
  agent)
    for s in "bad-site $BAD_PORT" "good-site $GOOD_PORT"; do
      set -- $s
      log="$OUT/agent-$1.log"
      echo "== agent: $1"
      (cd "$(mktemp -d)" && claude -p "/gdpreu:check http://localhost:$2/ CZ" --plugin-dir "$ROOT/plugins/gdpreu" \
        --allowedTools "Bash,Read,Grep,Glob,WebFetch" > "$log" 2>&1) || true
      chk() { if grep -qiE "$2" "$log"; then echo "  PASS  $1"; else echo "  FAIL  $1"; status=1; fi; }
      nochk() { if grep -qiE "$2" "$log"; then echo "  FAIL  $1"; status=1; else echo "  PASS  $1"; fi; }
      chk "opens with the not-legal-advice notice" "not legal advice|nejde o právní|není právní"
      chk "names the controller as responsible" "controller|správce"
      nochk "never claims compliance" "(is|are|site is|web je|je) (fully )?(gdpr[- ])?compliant|je v souladu s gdpr|splňuje gdpr|is gdpr compliant"
      if [[ "$1" == bad-site ]]; then
        chk "reports tracking before consent" "_ga|_fbp|before (any )?consent|před (udělením )?souhlas"
        chk "reports missing first-layer reject" "reject|odmítn"
        chk "reports pre-ticked purposes" "pre-?ticked|předzaškrt|zaškrtnut"
        chk "reports English-only banner on a Czech site" "english|anglick|language|jazyk"
      fi
    done
    ;;
esac
exit $status
