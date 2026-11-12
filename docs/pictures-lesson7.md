# Lesson 7 pictures: inventory and pilot result

Pilot of Phase 4a on Lesson 7 («中国银行在哪儿», `lesson-7.html`, shared by Grammar 1 and Foreign Language). The "pictures" of this lesson were not emoji: they were hand-drawn SVG icons (`ICON` in `tools/lsn3/legacy/g7.data.js`). This file records what was there, how clear it was, and what replaced it.

## Where pictures are used in the lesson

| Place | What shows | Size |
|---|---|---|
| Vocabulary tab, list rows | a picture for 26 of the 47 words | 44 px |
| Vocabulary tab, flashcard (back) | the same picture | 92 px |
| Practice, activity «الصور» (picture quiz) and the comprehensive quiz | "which word fits the picture?" for 18 words (`PICQ`) | 140 px |
| Practice, activity «الأماكن» (map question) | one drawn campus map (`mapSvg`) with a compass | full width |
| Levels challenge, review games | no pictures (text only) | none |

## Inventory (before the pilot)

Clarity: **clear** = a learner would name the word from the picture; **unclear** = it could be read as something else. The 11 unclear ones are in `docs/screenshots/pictures-l7-unclear-before.png` (360 px, light and dark).

| Word | Meaning | Old picture | In picture quiz | Clarity | Now |
|---|---|---|---|---|---|
| 教学楼 | teaching building | a plain house | yes | **unclear** (any house) | photo `teaching` |
| 楼 | building | same plain house | no | **unclear** | photo `teaching` |
| 图书馆 | library | a single book | yes | **unclear** (a book, not a place) | photo `library` |
| 运动场 | sports ground | a plain oval | yes | **unclear** (a ring or plate) | photo `field` |
| 体育馆 | gym | a dumbbell | yes | **unclear** (a dumbbell is not a hall) | photo `gym` |
| 饭馆 | restaurant | a rice bowl with chopsticks | yes | clear (food) | photo `restaurant` (one look for all places) |
| 超市 | supermarket | a shopping cart | yes | clear | photo `supermarket` |
| 银行 | bank | a columned building | yes | **unclear** (looks like a museum) | photo `bank` |
| 中国银行 | Bank of China | the same columned building | no | **unclear** | photo `bank` |
| 商店 | shop | a shop front | yes | clear | photo `shop` |
| 书店 | bookshop | the same shop front | no | **unclear** (identical to 商店) | photo `bookshop` |
| 邮局 | post office | an envelope with a red seal | yes | **unclear** (looks like an invitation) | photo `post` |
| 宿舍 | dormitory | a house with a bed | yes | clear | photo `dorm` |
| 知道 | to know | a light bulb | no | **unclear** (an idea, not knowing) | new drawing: a head with a check mark |
| 没关系 | no problem | a smiling face | no | **unclear** | new drawing: thumbs up |
| 北边 东边 南边 西边 | north, east, south, west | a compass with the red arrow on one side | yes | clear | kept |
| 去 | to go | an arrow in a circle | no | clear | kept |
| 哪儿 | where | a question mark in a circle | no | clear | kept |
| 卫生间 | restroom | the restroom pictogram | yes | clear | kept |
| 地方 | place | a folded map | no | clear | kept |
| 看 | to look | an eye | yes | clear | kept |
| 桌子 | table | a table | yes | clear | kept |
| 书包 | school bag | a backpack | yes | clear | kept |
| Map question | campus map | drawn map with labelled buildings and a north arrow | (map question) | clear | kept |

Words with **no picture at all** before: the 11 position and distance words 左边 右边 前边 后边 上边 下边 里边 外边 旁边 这儿 那儿, and the function words 在 教学 ……边 还 跟 吧 太 了 对不起 就 (no picture is needed for those).

## What changed

- **Photos** (11 files, 15-36 KB each, 299 KB in all) for the place nouns, so that places look like one family: 教学楼 楼 图书馆 运动场 体育馆 饭馆 超市 银行 中国银行 商店 书店 邮局 宿舍. Icons stay for concepts and objects.
- **New drawings** in one style (a red ball and a pink box on the 64x64 grid, the site's stroke and palette, light and dark): 左边 右边 前边 后边 上边 下边 里边 外边 旁边 这儿 那儿 (the 11 position words, which also join the picture quiz) and the redrawn 知道 and 没关系.
- Every photo: 4:3, 480x360, WebP, lazy-loaded, Arabic alt text, width and height set, the old icon underneath (shown if the photo fails to load).
- Sources, authors and licences: `vendor/images/NOTICE.md` (written by `tools/images.py`), and the credits list on the hub's About tab.
- Everything else (storage keys, URLs, quiz behaviour) is unchanged.

## Decisions to review

1. All place nouns got photos, including four whose icons were already clear (饭馆 超市 商店 宿舍), so the places read as one set. Revert any of them by deleting its entry from `PHOTO` in `g7.data.js`.
2. Three photos carry a visible shop or bank name (Freebirds, US Bank, Newcastle United stand) and one a small distant crowd (sports hall). They were chosen over alternatives because they read most clearly; swap them if you prefer.
3. Several photos are CC BY-SA, which requires the same licence for the resized copies; this is recorded and credited.

## Phase 4b pilot: illustrated scenes for 图书馆, 银行, 邮局

Feedback: the photos do not appeal. Two illustrated versions were built for the three places and can be compared on the real page with a preview switch (to be removed after the decision):

| Link | Shows |
|---|---|
| `lesson-7.html` or `?pics=a` | **A**: scenes drawn for the site (`tools/scenes.py`, 5-11 KB each) |
| `?pics=b` | **B**: Openclipart public-domain clip art (`tools/illus_b.py`, 23-126 KB each) |
| `?pics=photo` | the Phase 4a photos, for comparison |

Fallback chain if a scene cannot load: the photo, then the old icon. Arabic alt text, lazy loading, width/height and the fixed frames are unchanged. Side-by-side screenshots at 360 px: `docs/screenshots/pics4b-light.png`, `pics4b-dark.png`.

Source check for B: unDraw is reachable but its licence forbids automated downloading, searching or scraping without consent, so nothing was fetched from it; Pixabay is blocked by a Cloudflare challenge (API needs a key), not bypassed; Wikimedia Commons was rate limiting at test time; Openclipart is reachable and CC0, and was used. Its results are single figures in mixed styles, not scenes, so B is a weak comparison.
