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
- Wrap step: `python3 lsn/wrap2.py <file.html>` → `w-<file>.html` (the hosted copy) → copy over the repo file.
- Shared hub storage key: `zh-hub-v1`; `S.dues[course][word]`. gram and fl share lesson files; lessons write dues to both (`CRS='gram,fl'`).
