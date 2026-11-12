"""Version B of the Phase 4b pilot: public-domain clip art from Openclipart (CC0), slimmed and placed on a plain backdrop.

    python3 tools/illus_b.py fetch DIR     download the three source SVGs from openclipart.org into DIR (polite: one request every few seconds)
    python3 tools/illus_b.py build DIR     slim them (drop editor metadata, round numbers) and write vendor/images/lesson7/b/<place>.svg (480x360)

Openclipart publishes everything under CC0 (https://openclipart.org/share), so modification and redistribution are allowed and no credit is
legally required; the authors are credited anyway (vendor/images/NOTICE.md and the About tab). Changes made: metadata removed, numbers rounded,
scaled and placed on a 480x360 backdrop colour. The artwork itself is not altered.
"""
import os, re, subprocess, sys, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'vendor', 'images', 'lesson7', 'b')
UA = 'static-learning-site-pilot/1.0 (illustration licence check)'
# place -> (openclipart id, slug, author, title, backdrop colour, fit)
SRC = {'library': (330620, 'librarian-5', 'oksmith', 'Librarian (#5)', '#F6E6CF', 'h'),
       'bank': (330655, 'stop-2', 'oksmith', 'Stop (#2)', '#E4EEEC', 'h'),
       'post': (327170, 'post-office', 'j4p4n', 'Post Office', '#F8E6DA', 'h')}

def fetch(d):
    os.makedirs(d, exist_ok=True)
    for k, (i, *_ ) in SRC.items():
        subprocess.run(['curl', '-sS', '-m', '60', '-A', UA, '-L', 'https://openclipart.org/download/%d' % i, '-o', os.path.join(d, '%d.svg' % i)], check=True); time.sleep(4)

def slim(t, dec=1):
    t = re.sub(r'<\?xml[^>]*\?>|<!DOCTYPE[^>]*>|<!--[\s\S]*?-->|<metadata[\s\S]*?</metadata>|<sodipodi:[^>]*/>|<sodipodi:[\s\S]*?</sodipodi:[a-z]+>', '', t)
    t = re.sub(r'\s(sodipodi|inkscape):[a-z-]+="[^"]*"|\sxmlns:(dc|cc|rdf|sodipodi|inkscape|xlink)="[^"]*"|\s(id|version)="svg\d*"', '', t)
    t = re.sub(r'-?\d+\.\d{2,}', lambda m: ('%.*f' % (dec, float(m.group(0)))).rstrip('0').rstrip('.') if dec else '%d' % round(float(m.group(0))), t)
    return re.sub(r'\s+', ' ', t).strip()

def build(d):
    os.makedirs(OUT, exist_ok=True)
    for k, (i, slug, author, title, bg, fit) in SRC.items():
        t = open(os.path.join(d, '%d.svg' % i), encoding='utf8').read()
        m = re.search(r'<svg[^>]*>', t); head = m.group(0)
        vb = re.search(r'viewBox="([^"]+)"', head).group(1).replace(',', ' ').split(); vw, vh = float(vb[2]), float(vb[3])
        body = slim(t, 1)
        body = re.sub(r'^<svg[^>]*>', '', body); body = re.sub(r'</svg>\s*$', '', body)
        h = 340.0; w = h * vw / vh
        if w > 460: w = 460.0; h = w * vh / vw
        x = (480 - w) / 2; y = 360 - h - 10
        inner = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="%.1f" y="%.1f" width="%.1f" height="%.1f" viewBox="%s">%s</svg>' % (x, y, w, h, ' '.join(vb), body)
        s = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 480 360" width="480" height="360" role="img"><rect width="480" height="360" fill="%s"/>%s</svg>' % (bg, inner)
        open(os.path.join(OUT, k + '.svg'), 'w', encoding='utf8').write(s); print('%-8s %6d bytes' % (k, len(s.encode('utf8'))))

if __name__ == '__main__':
    {'fetch': fetch, 'build': build}[sys.argv[1]](sys.argv[2])
