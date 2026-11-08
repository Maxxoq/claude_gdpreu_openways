#!/usr/bin/env bash
# Tags and publishes a release whose version is already in plugin.json and CHANGELOG.md.
#   ./scripts/release.sh            # releases the version from plugin.json
# Steps before running: bump "version" in plugins/gdpreu/.claude-plugin/plugin.json,
# move [Unreleased] notes into a new "## [x.y.z] — YYYY-MM-DD" section, commit.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

VERSION=$(python3 -c 'import json;print(json.load(open("plugins/gdpreu/.claude-plugin/plugin.json"))["version"])')
TAG="v$VERSION"

[[ -z "$(git status --porcelain -uno)" ]]      || { echo "working tree not clean — commit first"; exit 1; }
grep -q "^## \[$VERSION\]" CHANGELOG.md     || { echo "CHANGELOG.md has no section for $VERSION"; exit 1; }
! git rev-parse -q --verify "refs/tags/$TAG" >/dev/null || { echo "tag $TAG already exists"; exit 1; }
./scripts/build.sh --check
claude plugin validate ./plugins/gdpreu >/dev/null && claude plugin validate . >/dev/null

# Release notes = the CHANGELOG section for this version
NOTES=$(awk -v v="$VERSION" '$0 ~ "^## \\[" v "\\]" {on=1; next} on && /^## \[/ {exit} on' CHANGELOG.md)

git tag -a "$TAG" -m "$TAG"
git push -q origin HEAD "$TAG"
gh release create "$TAG" --title "$TAG" --notes "$NOTES"
echo "released $TAG"
