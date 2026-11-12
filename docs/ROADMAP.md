# Task: Develop the 汉语加油站 platform based on student feedback

## Context
- Static HTML site teaching Chinese to Arabic speakers. Instructor: Dr. Mahmod Alsideig (大漠老师), University of Jeddah.
- Repo: `damoe2290-ai/hanyu-jiayouzhan` (branch `main`), deployed on Vercel: https://hanyu-jiayouzhan.vercel.app
- `index.html` = home page (courses, dictionary, spaced review), generated from `tools/hub.html`.
- Lessons are standalone HTML pages: `lesson-N` (Grammar 1 / Foreign Language, shared files), `prac-N` (Reading 1), `lis-N` (Listening 1), `biz-N` (Practical Chinese), `cult-N` (Culture).
- **Read `tools/README.md` first.** Lessons 9/10 and all prac/lis/biz/cult pages are generated from Python templates (`tools/lsn3/`). **Edit the template or generator and rebuild; never hand-edit generated lesson files.** `lesson-6/7/8.html` are hand-built with no generator (edit directly, or regenerate them onto the new template).
- Arabic RTL interface; Chinese and pinyin are LTR. Audio via Web Speech (`speechSynthesis`). State in `localStorage` (site key `zh-hub-v1`; each lesson has its own key).
- Audience: university students, mostly on phones. Design for 390px first, then 1100px.

## Fixed constraints (do not violate)
1. **Do not change name/title strings** ("汉语加油站", "أ. محمود الصديق", "Dr. Mahmod Alsideig · 大漠老师", course names and lesson titles, etc.).
2. The English copyright footer exists on the home page and the culture lessons: "© 2026 Dr. Mahmod Alsideig · 大漠老师 · All rights reserved." plus a no-copy line. Add it to any new page; ask before rolling it out to all old lessons.
3. Student-facing UI text is Arabic. Questions directed at me must be multiple-choice (numbered options).
4. No heavy libraries and no new build step. Pinned-version CDN libraries are allowed, but always with a **graceful fallback that works without them**.
5. Keep performance: a single lesson file under 250KB where possible.
6. After each phase: test automatically (`tools/lsn3/t3.js` for lessons, `tools/hubt/tg.js` for the hub) at 390px and 1100px, light and dark, then `git commit`, `git push`, and report in a short Arabic summary: what was done, what was not, and what you need from me. Include before/after screenshots.
7. Commit messages end with the attribution lines of your own session.
8. Be honest: if you cannot test something (e.g. speech recognition on iPhone), say so; never claim it works.
9. Do not bring any educational content (Chinese text, translations) from outside the book files in the project. Writing questions and Arabic explanations is allowed, but tell me when you do.
10. **No server, no accounts:** no Supabase, no database, no login, no API keys, no in-site AI lesson builder. The site stays static; progress lives only on the student's device (`localStorage`). If a feature seems to need a server, stop and ask me instead of adding one.
11. **No locking, anywhere:** every course, lesson, level and activity is open from the start. Pass rates, XP and progress may mark and recommend (a badge, a "recommended next" highlight) but must never block opening anything, and no control may be disabled because of progress.

## Phase 0A: Quick wins (from the UI/UX audit; do this first)
Measurements come from the audit at 390px and 1280px; re-measure after fixing.
1. Add the Google Fonts link (IBM Plex Sans Arabic, Noto Serif SC) to the hub. It currently loads none, so it differs from the lessons.
2. Tag all Chinese text with `lang="zh-CN"` and isolate it inside Arabic text with `<bdi>` or `unicode-bidi: isolate` (e.g. "先...然后..." and lesson titles break when wrapped).
3. Add a back-to-home link to lessons 6, 7 and 8 (they have none), and a "Next lesson" button at the end of every lesson.
4. Fix contrast (WCAG AA): white text on orange and gold book covers and tags (2.5-2.9), dark-mode cover colours, pinyin for tones 2 and 5 (about 4.1), card borders (1.26). Use values such as `#8A5A00` for gold text and borders around `#D9C9AE`.
5. Raise all interactive controls (pills, theme button, speaker buttons, chips) to at least 44x44px. Each lesson has 29-47 smaller targets.
6. Standardise digit style on Western 0-9 in the interface. Do not touch course names or titles.
7. Make the hub honour `prefers-reduced-motion`, as the lessons do.
8. Show a quiet hint if the device has no Chinese voice.

## Phase 0B: Shared foundation and design system
1. Extract the duplicated variables and components from the 23 pages into two shared files, `zh-ui.css` and `zh-ui.js`, injected by the generators and templates (`tpl.html`, `tplc.html`, `tplt.html`, `hub.html`). Move lessons 6-8 onto the template (with an "extras" slot so their pictures, picture quiz and interactive grammar keep working, and keep their current localStorage keys).
2. One header and one tab style across the hub, lessons and culture lessons (today there are two styles; the theme button is square on the hub and round in lessons). Unified header: back / home / title / settings.
3. **Keep the existing identity (ink and red seal on rice paper); do not replace it with a generic edtech look.** Colours: `--bg #FBF6EE`, `--surface #FFFDF9`, `--fg #2B1D18`, accent red `#B8322A`. Add state colours (success / warning / danger / info) with a soft variant each, and two shadow levels.
4. Fonts: IBM Plex Sans Arabic for UI, Noto Naskh Arabic for long culture reading, Noto Serif SC for hanzi at 20px and above, Noto Sans SC below 20px, IBM Plex Sans for pinyin and English. Type scale 12/14/16/18/22/28/36; hanzi display sizes 32/48/72/104; line-height 1.65 Arabic, 1.4 Chinese. 4px spacing grid; radii 8/12/16/24; motion 150/220/320ms, each with a reduced-motion fallback.
5. **Tone display setting** stored in a new key `zh-ui-v1`, with three modes: colours / tone marks only / numbers (ma3). Keep the current default tone colours unchanged. Add the colour-blind-safe palette (tone 1 `#C62828`, 2 `#B45309`, 3 `#1D5FB8`, 4 `#7B3FA0`, neutral grey) as a selectable option.
6. One SVG icon set instead of the text character ◐ and emoji used as icons. Shared components: header, tab, buttons (primary / secondary / ghost), labelled icon button, speaker button, hanzi block (hanzi + pinyin + gloss), flashcard, quiz option with correct/incorrect states, progress ring, badge (locked / earned), empty state.
7. Fallback if the shared files fail to load: each page keeps its inline CSS; `zh-ui.css` loads after it and only overrides; back/next are plain `<a>` links that work without JS.
8. Show before/after screenshots of the hub and one lesson from each course at 390 and 1100px, light and dark.

## Phase 1: Navigation experience and quick fixes
1. **The logo returns to the hub smoothly.** Clicking the logo/seal in any lesson returns to the home page (to the right course, `index.html#<course>`), with a visible affordance that it is clickable.
2. **One-step undo in every typing field** (pinyin, character, sentence...): delete one character or syllable, not the whole word, plus a separate clear-all button. Verify with the mobile keyboard.
3. **Merge lessons into the main site:** instead of opening each lesson in a new tab, open lessons inside the site (a full-screen iframe or inline loading) with a fixed top bar containing "Back to course" and "Home". Keep direct `lesson-N.html` URLs, saved progress and the browser back button working. The site is served over HTTPS on Vercel, so `file://` limitations do not matter for real students. Propose the best option (iframe vs inline loading) with pros and cons before implementing. Decide this together with the hub rebuild in Phase 5.

## Phase 2: Real learning
4. **Typed answers, not only multiple choice.**
   - Input types: pinyin with tones (accept `ni3` and `nǐ`), Chinese character/word (with a pinyin input panel or IME support), sentence translation.
   - Tolerant grading: ignore spaces and punctuation; distinguish "close" (wrong tone) from "wrong".
   - A "hint" button (first character/syllable) instead of frustration, with a points penalty.
5. **20-25 questions per lesson in three difficulty levels (easy / medium / hard):**
   - Easy: multiple choice, matching, true/false.
   - Medium: sentence ordering, multiple-choice cloze, listening.
   - Hard: typing pinyin, typing characters, typing sentences, typed cloze.
   - Shown with a level bar; the pass-rate threshold only marks progress ("passed" badge) and recommends the next level (**recommended next, never locked**: every level is open from the start); missed questions repeated at the end of the session.
   - First build **a complete sample on Lesson 9 (Grammar 1)** and show it to me before rolling out. Extend `tools/lsn3/build3.py` so it auto-generates part of the questions from vocabulary and sentences, with the option to add manual questions in the lesson's data file.
6. **Step-by-step character writing (stroke order):** use Hanzi Writer (pinned version, CDN allowed) to animate stroke order, then let the student write with wrong-stroke correction and hints. Inspect how the current "Writing" tab works first, then decide how to integrate. Without internet or if the library fails to load, fall back to the current display.

## Phase 3: Interaction and review
**Status (item 7):** the four review mini-games are in the hub's review tab (time attack, read without help, type from pinyin, type from Arabic); details and point values in tools/README.md. Item 8 (speaking) is not started.

7. **Review mini-games** inside the hub's review tab, based on spaced-review words (`S.dues`), with at least four modes:
   - Time attack (60 seconds, points and streak).
   - Read without pinyin or translation (character only; student reveals and self-rates).
   - Type the character from pinyin.
   - Type the character from the Arabic translation.
   - Game results update the spaced scheduling just like the current "forgot / know" buttons.
8. **Speaking with feedback:** use the Web Speech API for recognition (`zh-CN`). The student reads a sentence; compare the recognised text with the target at character level and show matching and differing characters. State clearly that this checks "was my sentence understood", not precise tone assessment. If the browser does not support recognition (e.g. iOS Safari usually), hide the feature gracefully with a one-line Arabic explanation. Never claim it works on devices you have not tested.

## Phase 4: Images and content
9. **Review the images in lessons:** inventory the "choose the matching picture" activities (icons/emoji used as pictures). Show me screenshots of the least clear cases and propose replacements (simple SVG icons in a consistent style, or helper captions). **I will attach examples of unclear images; if they do not arrive, ask me before implementing.**
10. **Remaining lessons:** the book 《发展汉语初级综合1》 has 30 lessons and we are currently at 6-10. Once the Phase 2-3 templates are stable, add lessons gradually (course by course, in small batches), with any lesson open to the student without prerequisites. Ask me which course to start with and give a size estimate first. Sources are the book files I upload (scanned PDFs: read the pages and visually verify OCR).

## Phase 5: Eight-level structure (display only, no server)
**Status:** first step done (odd levels only: Level 1 Grammar 1 + Reading 1, Level 3 Listening 1, Level 5 Practical Chinese, Level 7 Chinese Culture; Foreign Language as an extra track): `tools/levels.json`, the Level -> Course -> Lessons hub and the student dashboard (see tools/README.md). Levels 2/4/6/8 are added by data only when the study plan arrives; nothing is shown for missing courses.

The university plan is 4 years x 2 semesters = **8 levels**. Each level contains several courses (grammar, reading, listening, speaking, writing, culture...), and each course has its lessons. Do this after Phases 1-4 pass.

1. **One data file for the structure** (`tools/levels.json` or whatever fits the project) describing: levels (number, year, semester, Arabic name), the courses inside each level (id, Arabic and Chinese names, code, order, status: available / in preparation), and each course's lessons. Do not hard-code the structure in UI code; moving a course between levels must be a one-line edit in this file.
2. **Home page:** new order "Level -> Course -> Lessons" instead of "Course -> Lessons". Students see cards for levels 1-8 (available and upcoming); entering a level shows its courses as cards. Keep everything that works now (dictionary, spaced review, "About" tab).
3. **Mapping of current courses to levels (instructor's final decision):**
   - Level 1: "Grammar 1" (قواعد ١) and "Reading 1" (القراءة ١).
   - Level 3: "Listening 1" (الاستماع ١).
   - Level 5: "Practical Chinese" (اللغة الصينية العملية, 新丝路·中级速成商务汉语).
   - Level 7: "Chinese Culture" (الثقافة الصينية).
   - "Foreign Language" (لغة أجنبية): a **separate level/section outside the eight levels** (an independent track shown on the home page next to the levels, not inside any of them). It shares the same lessons as Grammar 1 (the same `lesson-N.html` files, with separate dictionary and review). Keep that arrangement and do not duplicate files. If this is not what I meant, I will correct you.
   - Keep course names as they are (even "Listening 1" in level 3) and do not renumber them.
   - Internal course ids stay unchanged in code (`gram`, `fl`, `prac`, `lis`, `biz`, `cult`) so students' progress does not break.
4. **Other levels (2, 4, 6, 8) and the remaining courses of each level:** do not invent course names or codes. Show them as "coming soon" with no courses until I provide the real study plan (PDF/Excel/images). Then convert it into `levels.json` and review it with me before publishing.
5. **No locking:** all levels, courses and lessons stay open so students can review what they missed. No prerequisites and no login.
6. **Progress:** saved only on the student's device (`localStorage`) per level, course and lesson, shown as a completion percentage on the cards. Use a well-organised key that does not break existing data, and write a migration that preserves current progress (existing keys: `zh-hub-v1` and the lesson keys).
7. **Old links keep working:** `lesson-N.html`, `prac-N.html`... and `index.html#gram` etc., with redirects that never break links the instructor already shared with students.
8. **Student dashboard is built together with this phase** (same hub redesign, not twice): a large "Continue where you left off" card, a daily-goal ring, a review-streak calendar and the count of reviews due. Real student completion percentage on course cards instead of the "available lessons out of 30" bar (that measures what is published, not student progress). Lesson state: done / in progress / new. Collapse the twelve dictionary/vocabulary tiles into one dictionary entry and one review entry with a course filter, and hide the "coming soon" tiles. Show XP and badges on the hub instead of only inside lessons.
9. Show me screenshots of the new home page on mobile and desktop before publishing.

## Phase 6: Aesthetic and premium layer
Do this after the earlier phases are stable, within the constraints of "no server, no heavy libraries":
1. **Less noise in study screens:** a dialogue focus mode where pinyin, tones and translation each have a toggle, revealed line by line (today everything shows at once).
2. **Vocabulary flashcard:** a real 3D flip instead of the 220ms fade, with swipe gestures on mobile; larger and clearer previous/next buttons; a visible label for the "known" circles.
3. **Quizzes:** clear animations for correct and incorrect, a celebration when a badge is earned (red seal stamp rotating slightly), an end-of-lesson summary screen, and locked badges visually distinct from empty placeholders.
4. **Identity touches:** a large hanzi with generous white space like a calligraphy sheet, a brush-stroke underline under the active tab, a subtle paper texture, one loud colour (the red) per screen, tone colours muted in lists and vivid only on the flashcard.
5. **Ink-style illustrations** in one consistent style for course covers and empty states (lightweight SVG).
6. **Light sound effects** for feedback (optional, off by default, with a mute button).
7. **App-like experience:** a manifest and a service worker for offline use and "add to home screen", so nothing else breaks if they are unsupported.
8. **First visit:** a short optional welcome screen (level, daily goal).
9. English interface (optional): **do not start it before I decide**, and ask me about it.

## Order of work
Start by reading `tools/README.md` and inspecting the template and the hub, then show me a **short plan** (what you will change and where, and which choices need my decision) before starting. Execute in order: 0A, then 0B, then 1 through 6, delivering and publishing after each phase. Do not move to the next phase before the tests pass.
