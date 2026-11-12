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
- **Back arrow of lessons shared by Grammar and Foreign Language** (`lesson-N.html`): the hub remembers the course the student is in (`lastCourse` inside the existing `zh-hub-v1` key; not `last`, which is the index used by the "continue" chip) and `zh-ui.js` sends the arrow to `index.html#fl` when that was Foreign Language. Default and fallback (no `zh-ui.js`, nothing remembered) is Grammar; lessons of every other course always go back to their own course. Test: `PAGE_PREFIX= node tools/lsn3/t8.js`.

## Levels challenge (rolling out; status table at the end of this section)
A practice-tab card "التحدي بالمستويات" starts a session of 3 levels x 8 questions = 24:
- **Level 1 (easy):** 1 matching + 3 meaning + 2 true/false (from vocabulary) + 2 lesson multiple-choice/true-false questions.
- **Level 2 (medium):** 3 sentence-ordering + 3 multiple-choice cloze + 2 listening.
- **Level 3 (hard), typed answers:** 2 pinyin, 2 Chinese characters, 2 typed cloze, 2 sentence translations (Arabic -> Chinese).
- **Levels are never locked.** All three are open from the start (the Hard level can be the first one played). Reaching 75% (6 of 8; "close" answers count half; `L['lv_pass']` changes the rate) only shows a "passed" badge on that level and highlights the first level not passed yet as "recommended next"; it never blocks opening a level. A failed level can be retried with new questions, and the next level is offered anyway. A level bar shows the current level. This rule lives in the template, so every lesson that opts in gets it; `t7.js` asserts that no level card is locked or disabled.
- **Missed questions** (wrong or "close") are collected and offered as a repeat round at the end of the session ("راجع أخطاءك"); the same questions are asked again.
- **Typed answers:** pinyin accepts tone marks or digits, with or without spaces (`nǐ hǎo` = `ni3hao3` = `Ni3 Hao3`, via `window.zhUI.normPinyin`); right sounds with wrong or missing tones = **close**. Characters/sentences ignore spaces and punctuation; pinyin typed instead of characters = close; a sentence with at least 80% of the characters = close. Points: correct 10, close 5, **hint** (first syllable / character) costs 5 (a correct answer after a hint gives 5, a close one 0).
- State is kept inside the lesson's existing storage key as `S.lv = {passed:{1:true,..}, best:{1:7,..}}` (no new key). Without `zh-ui.js` (it provides `window.zhUI`) or without `D.lv` the card is not shown and the practice tab works as before.
- **How a lesson opts in:** `L['levels']=True` in its data module; `build3.lv_banks` then writes `D.lv` (banks for true/false, pinyin, characters, sentences, cloze) from the lesson's own vocabulary, example sentences and fill-in items. It uses no random numbers (other lessons' generated questions are unaffected: checked byte-for-byte). The level logic itself lives in `tpl.html` ("levels challenge" section) and reuses the existing question builders.
- **Manual questions** go in the lesson data file: `L['lv_extra']=[{'kind':'type_sent','ar':'<Arabic>','ans':'<Chinese>','py':'<pinyin>'}, ...]`. Kinds and required fields: `tf` (`zh`,`py`,`ar`,`a` = 1 true / 0 false), `type_py` (`zh`,`py`,`ar`), `type_zh` (`py`,`ar`,`ans`), `type_sent` (`ar`,`ans`), `type_cloze` (`pre`,`post`,`ans`,`ar`). Bad kinds or missing fields stop the build. No manual questions exist yet; everything in the Lesson 9 sample is derived from the book-based lesson data.
- Tests: `PAGE_PREFIX= node tools/lsn3/t7.js` (full sessions with an oracle, gating, retry, typed grading, hint penalty, repeat round, persistence, fallback, phone-height layout) and `cd tools/lsn3 && python3 t_lvbanks.py` (bank generator).
- **Authored vs generated questions:** generated banks are never written into a data module; they are rebuilt from the lesson's own vocabulary every build. Anything written by hand lives only in that lesson's `L['lv_extra']` list and is flagged `manual:1` in the page data, so it is always possible to list exactly which questions a person wrote.
- Run it on any lesson with `PAGE=lesson-10.html PAGE_PREFIX= node tools/lsn3/t7.js` (default `lesson-9.html`).
- **Roll-out status (levels):** on in every lesson that has a practice tab: lesson-6..10 (Grammar 1 / Foreign Language), prac-6..10 (Reading), lis-6..10 (Listening, built from the teacher's-book texts of PR #5), biz-4..6 (Practical Chinese). Culture lessons are not part of this. Hand-written questions so far: none.
- **Hand-built lessons 6-8:** they opt in with the same `L['levels']=True`. `build3.legacy_lv_banks` reads `VOCAB` and `FILL` out of their frozen `legacy/g<N>.data.js` with `jslit.py` (a small JavaScript-literal reader) and feeds the same generator, so nothing is copied by hand. They have no lesson multiple-choice questions, so level 1 is topped up with true/false questions (`levelQs` in `tpl.html`); lessons that have them are unchanged. `parity.js` hides the levels card (the one intended addition to their practice tab) and still compares everything else with the old pages: 332 checks, 0 differences.

## Stroke order with Hanzi Writer (rolling out; status table at the end of this section)
- **What the student gets** (Writing tab): a switch "ترتيب الخطوط | رسم حر". *Stroke order* shows the character, animates its strokes ("شاهد الكتابة"), then lets the student write it ("اكتب بنفسك") with stroke-by-stroke correction: a wrong stroke is rejected with a message, a hint highlights the next stroke automatically after 2 misses and on demand ("تلميح"), "من جديد" resets, "إخفاء/إظهار النموذج" toggles the outline. A completed character is remembered (`S.hw.done[char]` inside the lesson's existing state key) and marked in the character list. *Free drawing* is the unchanged old canvas (undo / clear / model).
- **Fallback, always the old canvas** (no switch, nothing else changes): library blocked or missing, stroke data missing or invalid for that character, offline, `fetch` unavailable, or the page opened from `file://` (the data is loaded with `fetch`, which browsers do not allow from disk; the deployed HTTPS site is fine). It does not depend on `zh-ui.js`.
- **Opt-in per lesson:** `L['hanzi_writer']=True` in the lesson's data module sets `D.hw`; lessons without it are unchanged (the code is inert in their pages). Only Lesson 9 has it. The library is loaded lazily (37 KB) when the Writing tab opens.
- **Vendored, no external request:** `vendor/hanzi-writer/` holds `hanzi-writer.min.js` v3.7.3 (MIT), the stroke data of only the 1,322 characters that occur in the lesson pages (`data/<hex code point>.json`, byte-identical to `hanzi-writer-data@2.0.1`, Arphic Public License) and the licence files (`LICENSE`, `COPYING.md`, `ARPHICPL.TXT`, `APL/`); `NOTICE.md` documents versions, integrity hashes, selection and dates. Both npm tarballs are verified against npm's SHA-512 hashes by the script.
- **Add or refresh data** (after adding lessons): `npm pack hanzi-writer@3.7.3 hanzi-writer-data@2.0.1`, then `python3 tools/hanzi_data.py <hanzi-writer-3.7.3.tgz> <hanzi-writer-data-2.0.1.tgz>`. `python3 tools/hanzi_data.py --check` lists lesson characters without stroke data (they simply fall back to the canvas).
- **Test:** `node tools/lsn3/t9.js` (starts its own static server): no external request, animation, writing a character by drawing along its real stroke paths so the library's own grading accepts it, wrong stroke, hint, persistence, switch to free drawing, another character, dark theme, all fallbacks, `file://`, lessons that did not opt in, vendored files. Not tested: real phones (touch drawing on a phone screen).
- Run it on any lesson with `PAGE=lesson-10.html node tools/lsn3/t9.js` (default `lesson-9.html`).
- **Roll-out status (stroke order):** on: lesson-9, lesson-10, prac-6..10 (Reading), lis-6..10 (Listening), biz-4..6 (Practical Chinese), lesson-6..8 (hand-built). Culture lessons have no Writing tab. Lessons 6-8 opt in like the others (`L['hanzi_writer']=True`; `build3.make` then adds `hw:1` to their data); the only change to their frozen `legacy/g*.writing.js` is the done marker on the character chips plus the `hwInit()` call. `parity.js` loads pages from `file://`, where stroke order cannot load its data, so it checks that these lessons are still identical to the old pages in fallback mode (332/332); `t9.js` (served over HTTP) tests the stroke-order mode on them. No points are awarded for stroke order (decision).

## Study-plan structure and student dashboard (Phase 5)
The hub (`index.html`, generated from `tools/hub.html`) shows **Level -> Course -> Lessons**. The structure is data: `tools/levels.json`. Adding a level, a course or a lesson is a **data-only change** (no code edits); `python3 tools/lsn3/t_levels.py` must keep passing.

### `tools/levels.json` schema (version 1)
```
{
 "schema": 1,
 "settings": {"daily_goal": 50, "done_at": 90},     points for the daily ring; completion % at which a lesson counts as "done"
 "levels":  [ {"n": 1, "year": 1, "semester": 1,
               "title": "المستوى الأول", "sub": "الفصل الدراسي الأول",   Arabic texts shown on the hub (edit freely)
               "courses": ["gram", "prac"]}, ... ],                      course ids, in display order
 "extra":   {"title": "...", "sub": "...", "courses": ["fl"]},         tracks shown below the levels (outside the 8 levels)
 "courses": {
   "gram": {"name": "قواعد ١",                  existing Arabic course name (unchanged)
            "book": "《...》", "cover": "...<br>...",   book title and the text on the cover
            "color": 1,                                 1..6 = the hub's --c1..--c6 cover colours
            "lessons": [ {"no": 6, "n": "六",          lesson number, seal character
                          "title": "الدرس السادس · 香蕉多少钱一斤",   '<Arabic ordinal> · <Chinese title>' (the hub splits at ' · ')
                          "desc": "...", "file": "lesson-6.html",
                          "key": "noor-lesson6-v1"} ]},    the lesson page's own localStorage key (t_levels.py checks it equals the page's KEY)
   "fl":   {"name": "...", ..., "lessons_from": "gram"}       a course that shares another course's lessons (no copy)
 }
}
```
- **To add level 2/4/6/8:** add an object to `levels` (a level must contain at least one course that has lessons: empty levels are not allowed, so nothing like "coming soon" is ever shown). **To move a course** (for example Business Chinese to Level 8) change the `courses` list of the levels: ids and names do not change. **To add a course:** add it to `courses` and list it in exactly one level or in `extra.courses`. **To add a lesson:** build the page, then add it to its course's `lessons`.
- Course ids (`gram`, `fl`, `prac`, `lis`, `biz`, `cult`) and lesson storage keys are the ones the students' progress already uses; do not rename them.
- `tools/lsn3/hubgen.py` (run by `rebuild_all.sh`) reads this file and measures each built lesson page (words, dialogue lines or topics, activity names) because the hub needs them for the completion percentage; the result is injected into the hub where the placeholder `%%LEVELS%%` stands in `tools/hub.html` (the tracked file keeps the placeholder; `index.html` has the data).
- **No locking:** every level and lesson is open; levels are only collapsible. The level that holds the student's last lesson is open by default.

### What the dashboard computes (all on the device, nothing is sent anywhere)
- **Completion %** of a lesson = exactly the progress bar of the lesson page, `(known words / words + heard dialogue lines / lines (culture: topics seen / topics, max 1) + activities with a best result / activities) / 3`, read from the lesson's existing key. Course and level % = average over their lessons. Badges: *not started* (nothing recorded), *in progress*, *done* (at least `settings.done_at` %). `t10.js` compares the hub value with each lesson page's own `#gprog` bar for all 22 lessons in three states.
- **Continue card:** `zh-hub-v1.lastLesson` (written by `zh-ui.js` when a lesson opens, and by the hub on click); for old data it falls back to `S.last` (index of the last Grammar lesson) and `S.lastCourse` decides Grammar or Foreign Language for the shared lessons.
- **Daily goal ring and streak calendar:** `zh-ui.js` (loaded by every lesson and the hub) notices XP growth in the lessons' own keys (`noor-*-v1`) and adds it to `zh-hub-v1.pts[YYYY-MM-DD]` (local dates), marks the day in `zh-hub-v1.days`, and keeps `zh-hub-v1.xpSum` (the XP total seen last). The first run only takes a snapshot, nothing is credited retroactively; a progress reset credits nothing. A reviewed word counts 2 points. The ring shows today's points against `settings.daily_goal`; the calendar shows the last 28 days; the streak counts consecutive days.
- **Storage:** no new key. New fields (`lastLesson`, `pts`, `xpSum`) live inside the existing `zh-hub-v1`; old state without them works (migration test in `t10.js` with a pre-populated old state: every old field and every other key stays byte-identical). The hub merges those fields before each save so it never overwrites what a lesson wrote.
- Dictionary and review tiles are collapsed by default ("أدوات سريعة"); each course also has its own dictionary/review page (button inside its block, or `index.html#gram` etc., which keep working).
- Tests: `python3 tools/lsn3/t_levels.py` (the data), `node tools/lsn3/t10.js` (the hub: structure, completion parity, dashboard, tracker, migration), and the older `HUB=index.html node tools/hubt/tg.js` / `th.js` (print-style checks of the course pages).
