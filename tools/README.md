# أدوات بناء 汉语加油站 (Build tools)

Static site, no framework. Lessons are **generated** HTML files; edit the data/templates here, never hand-edit generated `lesson-N.html`, `prac-N.html`, `lis-N.html`, `biz-N.html`, `cult-N.html`.

Layout mirrors the original working dir (scripts use relative paths: `../hub.html`, `../lsn/wrap2.py`):
- `hub.html` – source of `index.html` (hub: courses, dictionary, spaced review). Build: `python3 lsn/wrap2.py hub.html` → `w-hub.html` → copy to repo `index.html`.
- `lsn3/tpl.html` – lesson template (placeholders %%TITLE%% %%COURSE%% %%CRS%% %%SEAL%% %%H1%% %%SUB%% %%GTAB%% %%KEY%% %%DATA%%). `mk_tpl.py` derives it from `g6.html`.
- `lsn3/build3.py` – `python3 build3.py g9 g10` builds `lesson-9.html`, `lesson-10.html` from data modules.
- Lesson data: `g9.py g10.py` (gram/fl, via `gcm.py`), `b4-b6.py` (biz, via `cmb.py`), `cl*.py` (culture), prac/lis data in `r*.py` `s*.py`.
- `hub9.py`, `hubbiz.py` – examples of patching the hub (LESSONS array, VOCAB, dictionary chips).
- Tests (playwright-core, Chrome, `--no-sandbox`): `t3.js <lesson.html…>` auto-solves all activities at 390 and 1100px; `hubt/tg.js`, `hubt/th.js` test the hub.
- Lessons 6, 7, 8 (gram/fl) are the older hand-built pages: **no generator**, edit the HTML directly.
- Wrap step: `python3 lsn/wrap2.py <file.html>` → `w-<file>.html` (the hosted copy; moves the leading `<title>/<meta>/<link>/<style>/<script src>` run into a real `<head>`) → copy over the repo file.
- Shared hub storage key: `zh-hub-v1`; `S.dues[course][word]`. gram and fl share lesson files; lessons write dues to both (`CRS='gram,fl'`).

## Reproducible build (read first)
- Python 3.13 + `pip install -r tools/requirements.txt` (`jieba==0.42.1`, `pypinyin==0.55.0`). If jieba fails to build on Python 3.12+, see the workaround in `requirements.txt` (unpack the sdist and add it to `PYTHONPATH`).
- **`tools/rebuild_all.sh`** rebuilds every generated page (hub + lessons) in a temp copy and writes the result to the repo root; `tools/rebuild_all.sh --check` only reports which pages differ.
- Build order matters: the fill-in-the-blank generator calls `random.seed(11)` once per process, so a lesson's questions depend on which lessons were built before it in the same process. The groupings in `rebuild_all.sh` (`g9 g10`; `r6..r10 s6..s10` in ONE process; `b4 b5 b6`; `buildt.py 1 2 3 4`) reproduce the committed pages byte-for-byte.
- Known, intentional differences from pages committed before the shared-UI change: the template's newer `hubRev` (identical behaviour for single-course lessons) and `biz-4`: `去不了` is now read `liǎo` (a generator rule added after that page was built).
- `mk_tpl.py`, `mk_tplc.py`, `mk_tplt.py` are historical (they derived the templates from the hand-built lesson 6). The templates are now edited directly: **do not re-run them, they would overwrite the current templates.**

## Shared UI layer (repo root: `zh-ui.css`, `zh-ui.js`)
- Every page links `zh-ui.css` AFTER its inline `<style>` (it only overrides) and `zh-ui.js` with `defer`. If either fails to load, the page works with its own inline CSS and controls (`zh-ui.js` adds class `zh-ui` to `<html>` only when the CSS is present; that class hides the old header theme/slow buttons in favour of the settings sheet).
- Design tokens, 44px touch targets, unified header and tabs, state colours, shadows and the global `prefers-reduced-motion` rule live in `zh-ui.css`.
- `zh-ui.js`: settings sheet (gear in the header; it triggers the page's own theme/slow buttons, so each page keeps its own storage), the tone display setting (`zh-ui-v1`: `{"tone":"color"|"cb"|"marks"|"numbers"}`; default `color` = the original tone colours), and runtime `lang="zh-CN"` / `<bdi>` tagging of Chinese text (never inside flex/grid parents, where wrapping would split a flex item).
- Previous / next lesson links are plain `<a>` links made by the builders from `tools/lsn3/order.py` (`%%LNAV%%` in the templates). `python3 order.py` (run in `tools/lsn3`) checks the table against the data modules.
- Adding a lesson: add its data module, add it to `order.LESSONS`, add it to the build groups in `rebuild_all.sh`, and to the hub's `LESSONS`/`VOCAB`; then run `rebuild_all.sh`.

## Tests
`t3.js` (lessons), `t5.js` (culture topic pages), `hubt/tg.js`, `hubt/th.js` (hub) need `playwright` or `playwright-core` and a Chrome/Chromium. Environment variables: `CHROME` (browser path; defaults to `/usr/bin/google-chrome` or `/opt/pw-browsers/chromium`), `PAGE_PREFIX` (default `w-`; use an empty value to test the repo pages directly), `HUB` (hub file for the hub tests, default `hubt/index.html`). `t5.js` and `hubt/th.js` write screenshots (`t_*.png`, `hubt/home_*.png`) into the current directory: delete them before committing. Example from the repo root:
`PAGE_PREFIX= node tools/lsn3/t3.js lesson-9.html` and `HUB=index.html node tools/hubt/tg.js`.
