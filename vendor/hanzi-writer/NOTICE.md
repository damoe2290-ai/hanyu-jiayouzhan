# Vendored: Hanzi Writer

Stroke-order animation and stroke-by-stroke writing practice for the Writing tab. Everything here is served from this
folder: no external request is made. If a file is missing or fails to load, the page falls back to the free-drawing canvas.

| Part | Source | Version | Licence |
|---|---|---|---|
| `hanzi-writer.min.js` | npm `hanzi-writer` (https://github.com/chanind/hanzi-writer), unmodified | 3.7.3 | MIT (`LICENSE`) |
| `data/<hex code point>.json` | npm `hanzi-writer-data` (stroke data derived from Make Me a Hanzi and Arphic fonts), unmodified | 2.0.1 | Arphic Public License (`ARPHICPL.TXT`, translations in `APL/`) |

- Integrity: both npm tarballs were checked against the SHA-512 hashes published by npm (`sha512-fdOFrb1cXWL/pV/oplJkcdz...`, `sha512-nbQwM+MaryGoq7pBMIZLCd3...`).
- Selection: `data/` holds the stroke data of only the 1322 characters that occur in the lesson pages (see `CHARS.txt`); 0 character(s) have no upstream data (`NODATA.txt`). Each file is a byte-identical copy of the file with the same character in `hanzi-writer-data@2.0.1`; files are named by hexadecimal code point (for example `597d.json` is 好).
- Date of this selection: 2026-11-11. It is a subset only: no stroke data was edited, which keeps the files verbatim copies under section 1 of the Arphic Public License; the licence file is retained unaltered.
- Copyright notices (also in `COPYING.md`): Arphic PL KaitiM GB and UKai, Copyright 1999 Arphic Technology Co., Ltd.; Make Me a Hanzi, Copyright 1999 Arphic Technology Co., Ltd., copyright 2016 Shaunak Kishore; Hanzi Writer, Copyright (c) 2014 David Chanin. There is no warranty.
- Regenerate or extend (after adding lessons): `npm pack hanzi-writer@3.7.3 hanzi-writer-data@2.0.1`, then `python3 tools/hanzi_data.py <lib.tgz> <data.tgz>`. `python3 tools/hanzi_data.py --check` lists lesson characters without stroke data.
