"""Lesson pictures: photos from Wikimedia Commons, prepared for the site (reproducible).

    python3 tools/images.py build     fetch the files listed in tools/images.json from Wikimedia Commons (needs network), crop to 4:3,
                                       resize to 480x360, save WebP (quality about 75, under max_kb), and write
                                       vendor/images/credits.json and vendor/images/NOTICE.md from the files' own licence metadata
    python3 tools/images.py check     no network: every file in the spec exists, is a WebP of the right size and weight, and has a credit
                                       entry with a free licence (used by tools/lsn3/t_pictures.js)

Rules (see tools/README.md): only freely licensed photos (CC0 / public domain / CC BY / CC BY-SA), each with source URL, author, licence and
attribution recorded; no "NC" or "ND" licences; photos are never taken from books or restricted sites. Wikimedia asks API clients to be gentle
and to identify themselves with a generic name, so the tool waits between requests and retries politely when told to slow down.
"""
import html, io, json, os, re, subprocess, sys, time
from urllib.parse import urlencode

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(ROOT, 'tools', 'images.json')
UA = 'static-learning-site-pilot/1.0 (image licence check)'
FREE = re.compile(r'^(CC0|CC BY( |-)|CC BY$|Public domain|PD)', re.I)

def strip(x):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', x or ''))).strip()

def get(url, binary=False):
    for attempt in range(5):
        p = subprocess.run(['curl', '-sS', '-m', '60', '-A', UA, url], capture_output=True)
        time.sleep((4, 20, 60, 120, 180)[attempt])         # polite: Wikimedia rate-limits fast clients; back off a lot when told to
        ok = p.stdout[:1] == b'{' if not binary else p.stdout[:4] == b'RIFF' or p.stdout[:3] == b'\xff\xd8\xff'
        if ok:
            return p.stdout if binary else json.loads(p.stdout)
        sys.stderr.write('slowing down (%d): %r\n' % (attempt, p.stdout[:70]))
    raise SystemExit('could not fetch ' + url)

def infos(titles):
    """metadata of all files in ONE request (the API takes up to 50 titles), which keeps the number of requests small"""
    d = get('https://commons.wikimedia.org/w/api.php?' + urlencode({
        'action': 'query', 'format': 'json', 'titles': '|'.join(titles), 'prop': 'imageinfo',
        'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': 960}))
    got = {pg['title']: pg['imageinfo'][0] for pg in d['query']['pages'].values() if 'imageinfo' in pg}
    missing = [t for t in titles if t not in got]
    if missing: raise SystemExit('not found on Commons: %s' % missing)
    return got

def prepare(im, crop, max_px):
    w, h = im.size
    if crop == 'center':
        x0, y0, x1, y1 = 0.0, 0.0, 1.0, 1.0
    else:
        x0, y0, x1, y1 = crop
    box = [x0 * w, y0 * h, x1 * w, y1 * h]
    bw, bh = box[2] - box[0], box[3] - box[1]
    want = 4 / 3
    if bw / bh > want:                                    # too wide: cut the sides around the centre of the box
        nw = bh * want; box[0] += (bw - nw) / 2; box[2] = box[0] + nw
    else:                                                 # too tall: cut top and bottom around the centre
        nh = bw / want; box[1] += (bh - nh) / 2; box[3] = box[1] + nh
    return im.crop(tuple(int(round(v)) for v in box)).resize((max_px, max_px * 3 // 4))

def build():
    from PIL import Image
    spec = json.load(open(SPEC, encoding='utf8'))
    out = os.path.join(ROOT, spec['out']); os.makedirs(out, exist_ok=True)
    credits = []
    meta = infos([it['file'] for it in spec['images']])
    for it in spec['images']:
        ii = meta[it['file']]
        m = ii['extmetadata']
        lic = strip(m.get('LicenseShortName', {}).get('value'))
        if not FREE.match(lic) or re.search(r'\bN[CD]\b', lic):
            raise SystemExit('%s: licence %r is not allowed' % (it['id'], lic))
        raw = get(ii['thumburl'], binary=True)
        im = Image.open(io.BytesIO(raw)).convert('RGB')
        im = prepare(im, it.get('crop', 'center'), spec['max_px'])
        q = 75
        while True:
            buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
            if len(buf.getvalue()) <= spec['max_kb'] * 1024 or q <= 40: break
            q -= 5
        path = os.path.join(out, it['id'] + '.webp'); open(path, 'wb').write(buf.getvalue())
        credits.append({
            'id': it['id'], 'words': it['words'], 'alt': it['alt'], 'file': spec['out'] + '/' + it['id'] + '.webp', 'bytes': len(buf.getvalue()), 'quality': q,
            'title': it['file'], 'page_url': ii['descriptionurl'], 'source_url': ii['thumburl'].split('?')[0],
            'author': strip(m.get('Artist', {}).get('value')), 'licence': lic, 'licence_url': strip(m.get('LicenseUrl', {}).get('value')),
            'attribution': strip(m.get('Attribution', {}).get('value')) or strip(m.get('Credit', {}).get('value')),
            'changes': 'cropped to 4:3, resized to %dx%d, converted to WebP' % (spec['max_px'], spec['max_px'] * 3 // 4)})
        print('%-12s %5d bytes  q%d  %s  %s' % (it['id'], len(buf.getvalue()), q, lic, it['file']))
    json.dump(credits, open(os.path.join(ROOT, 'vendor/images/credits.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    notice(credits)

def notice(credits):
    L = ['# Image credits', '',
         'Photos used on the lesson pages. Every photo comes from Wikimedia Commons under a free licence and was cropped to 4:3, resized and converted to WebP',
         '(see `tools/images.py`, which writes this file from the licence data of each file). Other pictures on the site are original drawings.', '',
         '| Image | Used for | Author | Licence | Source |', '|---|---|---|---|---|']
    for c in credits:
        lic = '[%s](%s)' % (c['licence'], c['licence_url']) if c['licence_url'] else c['licence']
        L.append('| `%s` | %s | %s | %s | [%s](%s) |' % (os.path.basename(c['file']), ' '.join(c['words']), c['author'].replace('|', '/'), lic, c['title'].replace('File:', ''), c['page_url']))
    L += ['', 'Changes made to every image: ' + credits[0]['changes'] + '.', '',
          'Share-alike (CC BY-SA) images stay under the same licence in the form used here; attribution to the authors above is required.', '']
    L += ['## Illustrated scenes (Phase 4b pilot: library, bank, post office)', '',
          '**Version A** (`lesson7/a/*.svg`): original flat scenes drawn for this site, generated by `tools/scenes.py`. Not based on or traced from any other artwork; no licence restrictions.', '',
          '**Version B** (`lesson7/b/*.svg`): public-domain clip art from [Openclipart](https://openclipart.org/share) (CC0 1.0, modification and redistribution allowed; credit given although not required), built by `tools/illus_b.py`. Changes: editor metadata removed, numbers rounded, scaled, placed on a plain 480x360 backdrop colour.', '',
          '| File | Used for | Author | Licence | Source |', '|---|---|---|---|---|']
    import importlib.util
    sp = importlib.util.spec_from_file_location('illus_b', os.path.join(ROOT, 'tools', 'illus_b.py')); ib = importlib.util.module_from_spec(sp); sp.loader.exec_module(ib)
    words = {'library': '图书馆', 'bank': '银行 中国银行', 'post': '邮局'}
    for k, (i, slug, author, title, *_r) in ib.SRC.items():
        L.append('| `b/%s.svg` | %s | %s | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [%s](https://openclipart.org/detail/%d/%s) |' % (k, words[k], author, title, i, slug))
    L += ['', 'The switch `?pics=a|b|photo` on lesson-7.html is a preview aid and will be removed once one version is chosen.', '']
    open(os.path.join(ROOT, 'vendor/images/NOTICE.md'), 'w', encoding='utf8').write('\n'.join(L))

def check():
    from PIL import Image
    spec = json.load(open(SPEC, encoding='utf8')); cred = {c['id']: c for c in json.load(open(os.path.join(ROOT, 'vendor/images/credits.json'), encoding='utf8'))}
    bad = []; total = 0
    for it in spec['images']:
        p = os.path.join(ROOT, spec['out'], it['id'] + '.webp')
        if not os.path.exists(p): bad.append(('missing', it['id'])); continue
        b = os.path.getsize(p); total += b
        im = Image.open(p)
        if im.format != 'WEBP' or im.size != (spec['max_px'], spec['max_px'] * 3 // 4): bad.append(('format', it['id'], im.format, im.size))
        if b > spec['max_kb'] * 1024: bad.append(('weight', it['id'], b))
        c = cred.get(it['id'])
        if not c or not FREE.match(c['licence']) or not c['author'] or not c['page_url'].startswith('https://commons.wikimedia.org/'): bad.append(('credit', it['id']))
    print('images: %d, total %d bytes, problems: %s' % (len(spec['images']), total, bad))
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    {'build': build, 'check': check}[sys.argv[1] if len(sys.argv) > 1 else 'check']()
