#!/usr/bin/env bash
# Rebuild every generated page (hub + lessons) from the templates and data modules.
#
#   tools/rebuild_all.sh           build and copy the result into the repo root
#   tools/rebuild_all.sh --check   build into a temp dir and only report differences
#
# Requires python3 + the packages in tools/requirements.txt (jieba, pypinyin).
# The build is done in a temporary copy of tools/, so no intermediate files are left in the repo.
#
# IMPORTANT: the order and grouping of the build commands below is deliberate.
# The fill-in-the-blank generator uses random.seed(11) once per process, so the questions of a
# lesson depend on which lessons were built before it in the same process. This grouping is the
# one that reproduces the committed pages exactly.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$HERE")"
MODE="${1:-build}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export PYTHONDONTWRITEBYTECODE=1 PYTHONWARNINGS=ignore

cp -r "$HERE/lsn" "$HERE/lsn3" "$HERE/hub.html" "$TMP/"
cd "$TMP/lsn3"

python3 build3.py g6 g7 g8                                      # frozen hand-built lessons (no random state used)
python3 build3.py g9 g10                                        # grammar / foreign language
python3 build3.py r6 r7 r8 r9 r10 s6 s7 s8 s9 s10               # practical + listening (one process!)
python3 build3.py b4 b5 b6                                      # business
python3 buildt.py 1 2 3 4                                       # culture

PAGES="lesson-6 lesson-7 lesson-8 lesson-9 lesson-10 prac-6 prac-7 prac-8 prac-9 prac-10 lis-6 lis-7 lis-8 lis-9 lis-10 biz-4 biz-5 biz-6 cult-1 cult-2 cult-3 cult-4"
for p in $PAGES; do python3 ../lsn/wrap2.py "$p.html"; done
(cd .. && python3 lsn/wrap2.py hub.html)

changed=0
emit() {  # emit <built file> <repo file>
  if cmp -s "$1" "$2"; then return; fi
  changed=$((changed+1)); echo "differs: $(basename "$2")"
  if [ "$MODE" != "--check" ]; then cp "$1" "$2"; fi
}
for p in $PAGES; do emit "w-$p.html" "$ROOT/$p.html"; done
emit "$TMP/w-hub.html" "$ROOT/index.html"

echo "$changed page(s) differ from the repo."
if [ "$MODE" = "--check" ] && [ "$changed" -gt 0 ]; then exit 1; fi
