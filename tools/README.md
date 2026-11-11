# أدوات بناء 汉语加油站 (Build tools)

Static site, no framework. Lessons are **generated** HTML files; edit the data/templates here, never hand-edit generated `lesson-N.html`, `prac-N.html`, `lis-N.html`, `biz-N.html`, `cult-N.html`.

Layout mirrors the original working dir (scripts use relative paths: `../hub.html`, `../lsn/wrap2.py`):
- `hub.html` – source of `index.html` (hub: courses, dictionary, spaced review). Build: `python3 lsn/wrap2.py hub.html` → `w-hub.html` → copy to repo `index.html`.
- `lsn3/tpl.html` – lesson template (placeholders %%TITLE%% %%COURSE%% %%CRS%% %%SEAL%% %%H1%% %%SUB%% %%GTAB%% %%KEY%% %%DATA%%). `mk_tpl.py` derives it from `g6.html`.
- `lsn3/build3.py` – `python3 build3.py g9 g10` builds `lesson-9.html`, `lesson-10.html` from data modules.
- Lesson data: `g9.py g10.py` (gram/fl, via `gcm.py`), `b4-b6.py` (biz, via `cmb.py`), `cl*.py` (culture), prac/lis data in `r*.py` `s*.py`.
- `hub9.py`, `hubbiz.py` – examples of patching the hub (LESSONS array, VOCAB, dictionary chips).
- Tests (playwright-core, Chrome, `--no-sandbox`): `t3.js <lesson.html…>` auto-solves all activities at 390 and 1100px; `hubt/tg.js`, `hubt/th.js` test the hub.
- Lessons 6, 7, 8 (gram/fl) were hand-built; they now go through `tpl.html` too, with their lesson-specific code frozen in `lsn3/legacy/` (see "Extras slots" below). Build them with `build3.py g6 g7 g8`; do not edit the generated HTML.
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

## Extras slots (hand-built lessons 6-8)
`tpl.html` has empty-by-default slots that `build3.py` fills from `lsn3/legacy/g<N>.<slot>.js` when a lesson module has `L['legacy']` (`g6.py`, `g7.py`, `g8.py`):
- `%%X_DATA%%` (after the generated content block): vocabulary, drawings (`ICON`, `WORDPIC`, `PICQ`, `picHtml`, `scene`), dialogue data, sentence/fill/character data, `BADGES`, `ACTS`. It redefines the variables the template filled from `D`; later function declarations win.
- `%%X_GRAMMAR%%`: the interactive grammar section (its `renderGrammar` replaces the template's).
- `%%X_WRITING%%`: the lesson's writing section (stroke notes, character panel).
- `%%X_QUIZ%%`: extra quiz kinds: helper builders (`qWhere`, `qDate`...), `X.info` (activity-card labels) and `X.build(kind)` (cases the template does not know: `pic`, the lesson's special kind, `all`). `build()` and `renderPractice()` in the template call these hooks; both are no-ops when `X` is empty.
- `%%X_EVENTS%%` (right after `var A={}`): the lesson's grammar widget handlers (`A.<name>=...`).
These lessons have no data for the "lesson questions" and "write and speak" activities, so those cards do not appear for them. `L['key']` keeps each page's original localStorage key (`noor-lesson<N>-v1`) and `L['sub']` its original subtitle.
The snippets were extracted once from the old pages (commit `501fc2e`) by `lsn3/mk_legacy.py` and are now the source of truth. `lsn3/parity.js <old dir> <new dir>` compares old and new pages tab by tab (every tab panel, vocabulary-card clicks, word sheets, every grammar widget state, every writing character, the first question of each quiz kind with a re-seeded random generator). Last result: 332 of 332 checks identical for lessons 6, 7 and 8.

## Other shared behaviour
- Hub theme: the hub remembers its light/dark choice in `zh-hub-v1-theme` (same pattern as `<lesson key>-theme` in the lessons); `zh-hub-v1` itself is untouched.
- No-Chinese-voice hint (`zh-ui.js`): a dismissible bar, shown only when the browser lists voices but none is Chinese, or has no speech support at all. A device that lists no voices at first says nothing (no false alarm). Dismissal is stored in `zh-ui-v1.voiceHint`. Not tested on real phones (speech engines were simulated).

## Input behaviour (Phase 1)
- **Text fields have no toolbar.** Write & speak boxes and Phase 2's typed-answer fields use the phone's own keyboard, which already has backspace and undo (a delete / undo / clear-all toolbar was tried and removed after a test on a real Android phone: it only took space). Nothing in `zh-ui.js` attaches UI to a `textarea` or `input`.
- **Places without a system keyboard keep their buttons:** the hand-drawing canvas has **undo last stroke** (`A.wundo`) next to **clear all** (`A.wclear`); sentence-order questions have **remove last chip** (`A.unpicklast`) and **clear** (`A.unpickall`). The writing snippets of lessons 6-8 (`legacy/g*.writing.js`) have the same canvas buttons.
- **Pinyin helpers for typed answers (no UI):** `window.zhUI` from `zh-ui.js` offers `normPinyin(s)` (canonical form for tolerant grading: `nǐhǎo` = `ni3hao3` = `Ni3 Hao3`, neutral tone `ma` = `ma5`, `lv4` = `lǜ`), `syllables(s)` (`nǐhǎo` -> `["nǐ","hǎo"]`), `toNumbers(s)` and `lastUnit(s,mode)`.
- The toast ignores taps and shows at the top of the screen while a field has focus, so it never covers a field. Previous/next lesson links are hidden while a quiz question is on screen.
- Test: `PAGE_PREFIX= node tools/lsn3/t6.js lesson-9.html cult-2.html ...` (touch input, 390x340 viewport = the area left by a phone keyboard). It asserts that no toolbar appears on any text field (also on fields added later), that chips still insert text, that the toast stays out of the way, unit-tests `window.zhUI`, and checks the canvas, sentence-order and quiz-navigation behaviour. It cannot drive a real iOS/Android keyboard.
- Known nuance: the back arrow of lessons shared by Grammar and Foreign Language (`lesson-N.html`) always returns to the Grammar list (`index.html#gram`).

## Levels challenge (Phase 2 sample: Lesson 9 only)
A practice-tab card "التحدي بالمستويات" starts a session of 3 levels x 8 questions = 24:
- **Level 1 (easy):** 1 matching + 3 meaning + 2 true/false (from vocabulary) + 2 lesson multiple-choice/true-false questions.
- **Level 2 (medium):** 3 sentence-ordering + 3 multiple-choice cloze + 2 listening.
- **Level 3 (hard), typed answers:** 2 pinyin, 2 Chinese characters, 2 typed cloze, 2 sentence translations (Arabic -> Chinese).
- A level is passed with 75% (6 of 8; "close" answers count half; `L['lv_pass']` changes the rate). Level 2 unlocks after level 1, level 3 after level 2; a failed level can be retried with new questions. A level bar shows the current level.
- **Missed questions** (wrong or "close") are collected and offered as a repeat round at the end of the session ("راجع أخطاءك"); the same questions are asked again.
- **Typed answers:** pinyin accepts tone marks or digits, with or without spaces (`nǐ hǎo` = `ni3hao3` = `Ni3 Hao3`, via `window.zhUI.normPinyin`); right sounds with wrong or missing tones = **close**. Characters/sentences ignore spaces and punctuation; pinyin typed instead of characters = close; a sentence with at least 80% of the characters = close. Points: correct 10, close 5, **hint** (first syllable / character) costs 5 (a correct answer after a hint gives 5, a close one 0).
- State is kept inside the lesson's existing storage key as `S.lv = {passed:{1:true,..}, best:{1:7,..}}` (no new key). Without `zh-ui.js` (it provides `window.zhUI`) or without `D.lv` the card is not shown and the practice tab works as before.
- **How a lesson opts in:** `L['levels']=True` in its data module; `build3.lv_banks` then writes `D.lv` (banks for true/false, pinyin, characters, sentences, cloze) from the lesson's own vocabulary, example sentences and fill-in items. It uses no random numbers (other lessons' generated questions are unaffected: checked byte-for-byte). The level logic itself lives in `tpl.html` ("levels challenge" section) and reuses the existing question builders.
- **Manual questions** go in the lesson data file: `L['lv_extra']=[{'kind':'type_sent','ar':'<Arabic>','ans':'<Chinese>','py':'<pinyin>'}, ...]`. Kinds and required fields: `tf` (`zh`,`py`,`ar`,`a` = 1 true / 0 false), `type_py` (`zh`,`py`,`ar`), `type_zh` (`py`,`ar`,`ans`), `type_sent` (`ar`,`ans`), `type_cloze` (`pre`,`post`,`ans`,`ar`). Bad kinds or missing fields stop the build. No manual questions exist yet; everything in the Lesson 9 sample is derived from the book-based lesson data.
- Tests: `PAGE_PREFIX= node tools/lsn3/t7.js` (full sessions with an oracle, gating, retry, typed grading, hint penalty, repeat round, persistence, fallback, phone-height layout) and `cd tools/lsn3 && python3 t_lvbanks.py` (bank generator).
