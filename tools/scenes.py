"""Flat illustrated scenes for the lesson pictures (version A of the Phase 4b pilot): drawn for the site, original work.

    python3 tools/scenes.py      writes vendor/images/lesson7/a/<place>.svg   (480x360, no outlines, one palette, round-headed characters)

One style for all scenes: flat colour shapes without outlines (only hairline details), a limited warm palette taken from the site's design tokens
(red, gold, green, cream, brown) plus a few accents, characters made from the same parts (round head, tiny face, rounded torso, round hands) and
one prop family per place. Each scene has its own opaque backdrop, so it looks right on the light and the dark page. No text in the art.
The generator is the source: edit it and run it again; nothing here is traced from or modelled on any other artwork.
"""
import os, random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'vendor', 'images', 'lesson7', 'a')

C = dict(ink='#2B1D18', red='#B8322A', red2='#8F2620', gold='#C98A0A', gold2='#E6B33C', green='#2E7D4F', green2='#A9D3B5', teal='#3C8D93',
         blue='#3A6EA5', navy='#2F3E5C', orange='#E08A3C', cream='#FBF1E0', wall1='#F6E6CF', wall2='#E9D3B3', wood='#B07B50', wood2='#8E5F3F',
         wood3='#D9A06A', skin1='#F2C6A0', skin2='#D9A27A', skin3='#A8704A', hair1='#2B1D18', hair2='#6B3F26', hair3='#C9892F', glass='#CFE6EE',
         grey='#9AA7AD', grey2='#7C8A91', kraft='#C99A62', kraft2='#A87C48', paper='#FFF8EC')

def n(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')

def rect(x, y, w, h, fill, rx=0, extra=''):
    return '<rect x="%s" y="%s" width="%s" height="%s"%s fill="%s"%s/>' % (n(x), n(y), n(w), n(h), (' rx="%s"' % n(rx)) if rx else '', fill, extra)

def circ(x, y, r, fill, extra=''):
    return '<circle cx="%s" cy="%s" r="%s" fill="%s"%s/>' % (n(x), n(y), n(r), fill, extra)

def ell(x, y, rx, ry, fill, extra=''):
    return '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="%s"%s/>' % (n(x), n(y), n(rx), n(ry), fill, extra)

def path(d, fill, extra=''):
    return '<path d="%s" fill="%s"%s/>' % (d, fill, extra)

def person(cx, top, skin, hair, shirt, s=1.0, style='bob', legs=None, arms='down', held=None, tie=None):
    """a character: round head (radius 16s) with a tiny face, rounded torso, round hands. top = y of the top of the head.
    legs: colour of trousers (standing figure, drawn down to the floor at y = top + 150s) or None (only the upper body is drawn).
    arms: 'down' | 'front' (hands together in front) | 'up' (one hand raised)."""
    r = 16 * s; hy = top + r; ty = top + 36 * s; tw = 54 * s; th = 62 * s
    o = []
    if legs:
        o.append(rect(cx - 22 * s, ty + th - 6 * s, 20 * s, 56 * s, legs, 6 * s)); o.append(rect(cx + 2 * s, ty + th - 6 * s, 20 * s, 56 * s, legs, 6 * s))
        o.append(rect(cx - 25 * s, ty + th + 44 * s, 25 * s, 9 * s, C['ink'], 4 * s)); o.append(rect(cx, ty + th + 44 * s, 25 * s, 9 * s, C['ink'], 4 * s))
    o.append(rect(cx - tw / 2, ty, tw, th, shirt, 16 * s))
    if tie: o.append(path('M%s %s l%s %s l%s %s l%s %s z' % (n(cx - 5 * s), n(ty + 2 * s), n(10 * s), 0, n(-5 * s), n(26 * s), n(-5 * s), n(-26 * s)), tie))
    if arms == 'down':
        o.append(rect(cx - tw / 2 - 9 * s, ty + 6 * s, 17 * s, 50 * s, shirt, 8 * s)); o.append(rect(cx + tw / 2 - 8 * s, ty + 6 * s, 17 * s, 50 * s, shirt, 8 * s))
        o.append(circ(cx - tw / 2 - 0.5 * s, ty + 58 * s, 8 * s, skin)); o.append(circ(cx + tw / 2 + 0.5 * s, ty + 58 * s, 8 * s, skin))
    elif arms == 'front':
        o.append(rect(cx - tw / 2 - 8 * s, ty + 8 * s, 17 * s, 38 * s, shirt, 8 * s)); o.append(rect(cx + tw / 2 - 9 * s, ty + 8 * s, 17 * s, 38 * s, shirt, 8 * s))
        o.append(circ(cx - 9 * s, ty + 50 * s, 8 * s, skin)); o.append(circ(cx + 9 * s, ty + 50 * s, 8 * s, skin))
    elif arms == 'up':
        o.append(rect(cx - tw / 2 - 9 * s, ty + 6 * s, 17 * s, 50 * s, shirt, 8 * s)); o.append(circ(cx - tw / 2 - 0.5 * s, ty + 58 * s, 8 * s, skin))
        o.append('<g transform="rotate(-28 %s %s)">' % (n(cx + tw / 2), n(ty + 12 * s)) + rect(cx + tw / 2 - 8 * s, ty - 34 * s, 17 * s, 50 * s, shirt, 8 * s) + circ(cx + tw / 2 + 0.5 * s, ty - 34 * s, 8 * s, skin) + '</g>')
    o.append(rect(cx - 6 * s, ty - 8 * s, 12 * s, 14 * s, skin))
    o.append(circ(cx, hy, r, skin))
    if style == 'bob':
        o.append(path('M%s %s a%s %s 0 0 1 %s 0 v%s h%s v%s h%s v%s z' % (n(cx - r - 2 * s), n(hy + 3 * s), n(r + 2 * s), n(r + 3 * s), n(2 * r + 4 * s), n(12 * s), n(-5 * s), n(-8 * s), n(-(2 * r - 6 * s)), n(8 * s)), hair))
    elif style == 'short':
        o.append(path('M%s %s a%s %s 0 0 1 %s 0 q%s %s %s %s h%s q%s %s %s %s z' % (n(cx - r - 1 * s), n(hy - 1 * s), n(r + 1 * s), n(r + 2 * s), n(2 * r + 2 * s), n(-3 * s), n(-7 * s), n(-10 * s), n(-4 * s), n(-(2 * r - 8 * s)), n(-3 * s), n(2 * s), n(-2 * s), n(5 * s)), hair))
    elif style == 'bun':
        o.append(circ(cx, top - 3 * s, 8 * s, hair)); o.append(path('M%s %s a%s %s 0 0 1 %s 0 q%s %s %s %s h%s q%s %s %s %s z' % (n(cx - r - 1 * s), n(hy + 1 * s), n(r + 1 * s), n(r + 2 * s), n(2 * r + 2 * s), n(-3 * s), n(-8 * s), n(-10 * s), n(-5 * s), n(-(2 * r - 8 * s)), n(-3 * s), n(2 * s), n(-2 * s), n(6 * s)), hair))
    elif style == 'cap':
        o.append(path('M%s %s a%s %s 0 0 1 %s 0 z' % (n(cx - r - 2 * s), n(hy - 2 * s), n(r + 2 * s), n(r + 2 * s), n(2 * r + 4 * s)), held or C['navy'])); o.append(rect(cx - r - 6 * s, hy - 4 * s, 2 * r + 12 * s, 5 * s, held or C['navy'], 2 * s))
    o.append(circ(cx - 6 * s, hy + 1 * s, 1.7 * s, C['ink'])); o.append(circ(cx + 6 * s, hy + 1 * s, 1.7 * s, C['ink']))
    o.append('<path d="M%s %s q%s %s %s 0" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round"/>' % (n(cx - 4.5 * s), n(hy + 7 * s), n(4.5 * s), n(4 * s), n(9 * s), C['ink'], n(1.5 * s)))
    return ''.join(o)

def books_row(x, y, w, h, rnd):
    cols = [C['red'], C['green'], C['gold2'], C['blue'], C['orange'], C['cream'], C['teal'], '#7B5EA7']
    out = []; cx = x
    while cx < x + w - 6:
        bw = rnd.choice([8, 9, 10, 12, 14]); bh = h - rnd.choice([2, 6, 10, 14]); col = rnd.choice(cols)
        if cx + bw > x + w: break
        out.append(rect(cx, y + h - bh, bw, bh, col, 1)); cx += bw + 1.5
    return ''.join(out)

def shelf(x, y, w, h, rows, seed):
    rnd = random.Random(seed); out = [rect(x, y, w, h, C['wood'], 6), rect(x + 7, y + 7, w - 14, h - 14, C['wood2'], 3)]
    rh = (h - 14) / rows
    for r in range(rows):
        ry = y + 7 + r * rh
        out.append(books_row(x + 11, ry + 5, w - 22, rh - 10, rnd)); out.append(rect(x + 7, ry + rh - 5, w - 14, 5, C['wood3']))
    return ''.join(out)

def svg(body, bg_top, bg_bottom):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360" width="480" height="360" role="img">'
            + rect(0, 0, 480, 360, bg_top) + body + '</svg>')

def library():
    o = [rect(0, 262, 480, 98, C['wall2']), rect(0, 258, 480, 8, '#D6BC96')]
    o += [rect(196, 36, 96, 84, C['glass'], 8), rect(240, 36, 8, 84, C['wall1']), rect(196, 74, 96, 8, C['wall1']), circ(222, 56, 9, '#FFF3C4')]
    o += ['<path d="M240 0v22" stroke="%s" stroke-width="3"/>' % C['wood2'], path('M222 22h36l-6 22h-24z', C['gold'])]
    o.append(shelf(16, 40, 164, 218, 4, 3)); o.append(shelf(306, 40, 158, 218, 4, 8))
    o.append(rect(150, 236, 180, 70, C['wood'], 6))
    o.append(person(240, 118, C['skin2'], C['hair1'], C['red'], 1.0, 'bun', arms='front'))
    o.append(rect(142, 220, 196, 22, C['wood3'], 6))
    o.append(rect(266, 188, 50, 34, C['grey2'], 4)); o.append(rect(270, 192, 42, 26, C['glass'], 2)); o.append(rect(285, 222, 12, 6, C['grey']))
    o.append(rect(160, 204, 38, 8, C['blue'], 2)); o.append(rect(164, 196, 34, 8, C['gold2'], 2)); o.append(rect(162, 188, 34, 8, C['green'], 2))
    o.append(rect(212, 268, 56, 8, C['wood2'], 3))
    # a girl on the floor reading a big open book
    o.append(ell(84, 324, 52, 12, '#C8AA82'))
    o.append(rect(56, 272, 56, 52, C['teal'], 18)); o.append(rect(40, 310, 88, 18, C['navy'], 9))
    o.append(circ(84, 258, 16, C['skin1'])); o.append(path('M66 262a18 19 0 0 1 36 0v6h-6v-9h-24v9h-6z', C['hair2']))
    o.append(circ(78, 259, 1.6, C['ink'])); o.append(circ(90, 259, 1.6, C['ink']))
    o.append(path('M44 290l40-10 40 10v26l-40-8-40 8z', C['paper'])); o.append(path('M84 280v28', C['paper'], ' stroke="%s" stroke-width="2"' % C['gold'])); o.append(circ(50, 304, 7, C['skin1'])); o.append(circ(118, 304, 7, C['skin1']))
    # a boy standing in front of the right shelf with a book
    o.append(person(402, 160, C['skin1'], C['hair3'], C['orange'], 0.78, 'short', legs=C['blue'], arms='front'))
    o.append(rect(378, 222, 48, 14, C['red2'], 2)); o.append(rect(380, 219, 44, 5, C['paper'], 1))
    return svg(''.join(o), C['wall1'], C['wall2'])

def bank():
    o = [rect(0, 266, 480, 94, '#C2D1CE'), rect(0, 262, 480, 8, '#A9BAB6')]
    o += [circ(104, 168, 84, C['grey']), circ(104, 168, 66, C['grey2']), circ(104, 168, 48, C['grey']), circ(104, 168, 12, C['gold2'])]
    for a, (dx, dy) in enumerate([(0, -36), (31, -18), (31, 18), (0, 36), (-31, 18), (-31, -18)]):
        o.append(rect(104 + dx - 4, 168 + dy - 4, 8, 8, C['grey2'], 2))
    o.append(rect(96, 92, 16, 152, C['gold'], 4, ' opacity=".0"'))
    o.append(rect(196, 112, 270, 112, C['glass'], 10, ' opacity=".55"')); o.append(rect(196, 112, 270, 8, C['teal'], 4)); o.append(path('M226 124l-22 96h26l22-96z', '#FFFFFF', ' opacity=".35"'))
    o.append(person(332, 120, C['skin3'], C['hair1'], C['navy'], 1.0, 'short', arms='front', tie=C['red']))
    o.append(rect(186, 220, 292, 80, C['wood2'], 6)); o.append(rect(178, 208, 308, 20, C['wood3'], 6))
    for k, x in enumerate([214, 238, 262]):
        for j in range(4 + k):
            o.append(ell(x, 205 - j * 6, 13, 5, C['gold2'])); o.append(ell(x, 202 - j * 6, 13, 5, C['gold']))
    o.append(rect(380, 190, 56, 16, C['green'], 2)); o.append(rect(386, 182, 44, 12, C['green2'], 2)); o.append(circ(408, 200, 5, C['gold2']))
    o.append(rect(414, 240, 56, 4, C['wood3']))
    # a customer with a coin bag
    o.append(person(150, 142, C['skin1'], C['hair2'], C['green'], 0.95, 'bob', legs=C['ink'], arms='front'))
    o.append(path('M128 242q-14 6-12 26q2 14 22 14h22q20 0 22-14q2-20-12-26l-4 -10h-14z', C['kraft'])); o.append(circ(150, 262, 11, C['gold2'])); o.append(circ(150, 262, 6, C['gold']))
    return svg(''.join(o), '#E4EEEC', '#C2D1CE')

def post():
    o = [rect(0, 268, 480, 92, '#D9BE9C'), rect(0, 264, 480, 8, '#C5A77F')]
    o += [rect(300, 40, 156, 100, C['glass'], 8), rect(374, 40, 8, 100, '#F8E6DA'), rect(300, 86, 156, 8, '#F8E6DA')]
    # parcels on shelves
    o.append(rect(230, 150, 236, 118, C['wood'], 6)); o.append(rect(238, 158, 220, 102, C['wood2'], 3)); o.append(rect(238, 208, 220, 6, C['wood3']))
    for x, y, w, h in [(246, 166, 52, 40), (302, 176, 40, 30), (346, 160, 46, 46), (396, 172, 54, 34), (248, 218, 46, 40), (298, 228, 56, 30), (358, 222, 44, 36), (406, 214, 44, 44)]:
        o.append(rect(x, y, w, h, C['kraft'], 3)); o.append(rect(x + w / 2 - 3, y, 6, h, C['kraft2'])); o.append(rect(x, y + h - 6, w, 6, C['kraft2'], 2))
    o.append(rect(290, 232, 190, 64, C['red'], 6)); o.append(rect(282, 222, 206, 18, C['gold2'], 6))
    o.append(rect(318, 198, 46, 28, C['kraft'], 3)); o.append(rect(338, 198, 6, 28, C['kraft2']))
    o.append(rect(392, 206, 44, 18, C['paper'], 2)); o.append(rect(398, 210, 20, 3, C['red'])); o.append(rect(398, 216, 30, 3, C['grey']))
    o.append(person(392, 96, C['skin2'], C['hair1'], C['teal'], 0.98, 'bun', arms='down'))
    # a red post box
    o.append(rect(32, 130, 98, 156, C['red'], 14)); o.append(rect(26, 122, 110, 24, C['red2'], 12)); o.append(rect(48, 168, 66, 11, '#4A1511', 5)); o.append(rect(32, 196, 98, 8, C['red2']))
    o.append(circ(81, 232, 16, C['gold2'])); o.append(path('M70 228l11 8l11-8v-4h-22z', C['paper']))
    o.append(rect(44, 286, 74, 8, C['wood2'], 3))
    # a postman with a bag and a letter
    o.append(person(204, 142, C['skin1'], C['hair2'], C['blue'], 0.9, 'cap', legs=C['navy'], arms='front', held=C['navy']))
    o.append(rect(171, 218, 66, 54, C['kraft2'], 10)); o.append(rect(171, 218, 66, 14, C['kraft'], 7)); o.append(rect(186, 196, 34, 20, C['paper'], 2)); o.append(path('M186 196l17 12l17-12', 'none', ' stroke="%s" stroke-width="2"' % C['red']))
    return svg(''.join(o), '#F8E6DA', '#D9BE9C')

PLACES = {'library': library, 'bank': bank, 'post': post}

def main():
    os.makedirs(OUT, exist_ok=True)
    for k, f in PLACES.items():
        s = f(); open(os.path.join(OUT, k + '.svg'), 'w', encoding='utf8').write(s); print('%-8s %5d bytes' % (k, len(s.encode('utf8'))))

if __name__ == '__main__':
    main()
