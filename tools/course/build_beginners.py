"""Beginners course (دورة المبتدئين): builds beginners-<week>.html from tools/course/beginners.json.

    cd tools/lsn3 && python3 ../course/build_beginners.py        (rebuild_all.sh does it; writes into the current directory)

One data file -> one page per built week. Each page has two modes over the same data:
  - student mode: the standard lesson page (tools/lsn3/tpl.html: flashcards, dialogue with focus mode, stroke order, activities, summary, badges), filled from the
    data file, plus three new activities (tone drawing, classroom commands, pinyin builder) from x_quiz.js / x_events.js;
  - presenter mode: full-screen slides and tools (beg-present.js / beg-present.css at the repo root), fed by the same data (a JSON block in the page).
Also writes beginners-review.md (every Arabic string, grouped by week, for the author's corrections and the pinyin check) next to the pages.

Chinese and pinyin are taken from the data file exactly as written; pypinyin is only used to flag doubts (reported in the review file, never "corrected").
Token notation of the data file: 'w' = words separated by '|', each 'hanzi pinyin' (first space), punctuation alone, '$A' / '$B' = the names of the week.
"""
import json, os, re, random, sys, html as H

HERE = os.path.dirname(os.path.abspath(__file__))
LSN3 = os.path.join(os.path.dirname(HERE), 'lsn3')
DATA = os.path.join(HERE, 'beginners.json')
CJK = re.compile('[㐀-䶿一-鿿]')
MARKS = {'ā': 1, 'ē': 1, 'ī': 1, 'ō': 1, 'ū': 1, 'ǖ': 1, 'á': 2, 'é': 2, 'í': 2, 'ó': 2, 'ú': 2, 'ǘ': 2,
         'ǎ': 3, 'ě': 3, 'ǐ': 3, 'ǒ': 3, 'ǔ': 3, 'ǚ': 3, 'à': 4, 'è': 4, 'ì': 4, 'ò': 4, 'ù': 4, 'ǜ': 4}

def esc(s): return H.escape(str(s), quote=True)
def tone(s):
    for ch in s:
        if ch in MARKS: return MARKS[ch]
    return 5
def py_html(py): return ' '.join('<span class="t%d">%s</span>' % (tone(s), esc(s)) for s in py.split(' ') if s)
def cap(s): return s[:1].upper() + s[1:] if s else s

def parse_tokens(w, names, lex, vocab_ar):
    """'你 nǐ|好 hǎo|！' -> [{'zh','py'}|{'p'}]; '$B' expands to the week's name"""
    out = []
    for part in w.split('|'):
        if part.startswith('$'):
            part = names[part[1:]]
        if part and CJK.match(part[0]) and ' ' in part:
            zh, py = part.split(' ', 1)
            out.append({'zh': zh, 'py': py})
        elif part and CJK.match(part[0]):
            raise SystemExit('token without pinyin: %r' % part)
        else:
            out.append({'p': part})
    return out

def line_py(toks):
    s = ''
    for t in toks:
        if 'p' in t: s += t['p']
        else: s += (' ' if s and not s.endswith(('“', '(')) else '') + t['py']
    return cap(s.strip())
def line_zh(toks): return ''.join(t.get('zh') or t['p'] for t in toks)

def gloss_of(zh, lex, vocab_ar):
    return lex.get(zh) or vocab_ar.get(zh) or ''

def contour_svg(pts, cls='', w=84, h=64):
    """tone contour on a 5-level grid; pts = [[x 0..1, level 1..5]]"""
    px = ' '.join('%.1f,%.1f' % (8 + x * (w - 16), h - 8 - (lv - 1) / 4 * (h - 16)) for x, lv in pts)
    grid = ''.join('<line x1="4" x2="%d" y1="%.1f" y2="%.1f" class="g"/>' % (w - 4, h - 8 - i / 4 * (h - 16), h - 8 - i / 4 * (h - 16)) for i in range(5))
    return '<svg class="contour %s" viewBox="0 0 %d %d" aria-hidden="true">%s<polyline points="%s" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' % (cls, w, h, grid, px)

def spk(t, cls=''):
    return '<button class="spk %s" data-act="say" data-t="%s" aria-label="استمع"><svg viewBox="0 0 24 24" width="%d" height="%d" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg></button>' % (cls, esc(t), 36 if cls == 'big' else 20, 36 if cls == 'big' else 20)

def build_week(C, W, rng):
    names = W['names']
    lex = dict(W.get('lex', {}))
    vocab_src = list(W['vocab'])
    vocab_ar = {v['zh']: v['ar'] for v in vocab_src}
    for c in W['write']['chars'] + W['write'].get('recog', []): lex.setdefault(c['c'], c['ar'])
    # dialogues -> tokens
    dlgs = []
    for k, d in enumerate(W['dialogues'], 1):
        lines = []
        for ln in d['lines']:
            toks = parse_tokens(ln['w'], names, lex, vocab_ar)
            lines.append({'who': ln['who'], 'zh': line_zh(toks), 'py': line_py(toks), 'ar': ln['ar'], 'tok': toks})
        dlgs.append({'title': d['title'], 'lines': lines})
    sents = []
    for s in W['sentences']:
        toks = parse_tokens(s['w'], names, lex, vocab_ar)
        sents.append({'zh': line_zh(toks), 'py': line_py(toks), 'ar': s['ar'], 'toks': [t for t in toks if 'zh' in t]})
    # vocabulary with an example taken from the dialogues
    allsent = [(l['zh'], l['py'], l['ar']) for d in dlgs for l in d['lines']] + [(s['zh'], s['py'], s['ar']) for s in sents]
    vocab = []
    for v in vocab_src:
        zh = v['zh'].replace('…', '')
        ex = next((x for x in allsent if zh and zh in x[0] and x[0] != v['zh']), None)
        vocab.append({'zh': v['zh'], 'py': v['py'], 'ar': v['ar'], 'ex': list(ex) if ex else ['', '', ''], 'note': v.get('note', '')})
    classx = [{'zh': c['zh'], 'py': c['py'], 'ar': c['ar']} for c in W['class']]
    return {'names': names, 'lex': lex, 'dlgs': dlgs, 'sents': sents, 'vocab': vocab, 'classx': classx, 'vocab_ar': vocab_ar}

SYL_EXTRA = {'你': 'nǐ', '好': 'hǎo'}   # single characters used for tone drawing that are only parts of words in the data
def syl_of(W, zh):
    """pinyin of a single character known to the week (tones, sets, neutrals, builder, characters)"""
    if zh in SYL_EXTRA: return SYL_EXTRA[zh]
    s = W['sound']
    for grp in ('tones', 'sets', 'neutrals', 'builder'):
        for it in s.get(grp, []):
            if it['zh'] == zh: return it['py']
    for c in W['write']['chars'] + W['write'].get('recog', []):
        if c['c'] == zh: return c['py']
    raise SystemExit('no pinyin known for %r' % zh)

def student_data(C, W, B, rng):
    names = B['names']
    vocab = [dict(v, sup=0) for v in B['vocab']] + [{'zh': c['zh'], 'py': c['py'], 'ar': c['ar'], 'note': 'عبارة الفصل', 'ex': ['', '', '']} for c in B['classx']]
    seen = set(); vv = []
    for v in vocab:
        if v['zh'] in seen: continue
        seen.add(v['zh']); vv.append({'zh': v['zh'], 'py': v['py'], 'ar': v['ar'], 'ex': v['ex'], 'note': v.get('note', '')})
    vocab = vv
    tokpy = {}
    dlg = []; txt = {}
    for k, d in enumerate(B['dlgs'], 1):
        txt[k] = {'h': d['title'], 'scene': ''}
        for ln in d['lines']:
            who = {'A': 'S', 'B': 'X'}[ln['who']]
            tok = []
            for t in ln['tok']:
                if 'p' in t: tok.append([t['p']])
                else:
                    tok.append([t['zh'], t['py'], gloss_of(t['zh'], B['lex'], B['vocab_ar'])]); tokpy[t['zh']] = t['py']
            dlg.append({'text': k, 'who': who, 'zh': ln['zh'], 'ar': ln['ar'], 'tok': tok})
    for v in vocab: tokpy[v['zh']] = v['py']
    sent = []
    for s in B['sents']:
        tk = [t['zh'] for t in s['toks']]
        for t in s['toks']: tokpy[t['zh']] = t['py']
        if len(tk) >= 3: sent.append({'tokens': tk, 'zh': s['zh'], 'py': s['py'], 'ar': s['ar']})
    # fill-in-the-blank: one word of the sentence removed, two other words of the lesson as distractors
    pool = []
    for s in sent:
        for t in s['tokens']:
            if t not in pool and CJK.match(t[0]): pool.append(t)
    fills = []
    for s in sent:
        cands = [t for t in s['tokens'] if s['tokens'].count(t) == 1 and len(t) <= 3]
        if not cands: continue
        a = cands[len(fills) % len(cands)]; i = s['zh'].index(a)
        dis = [t for t in pool if t != a and t not in s['zh']]
        rng.shuffle(dis)
        if len(dis) < 2: continue
        fills.append({'pre': s['zh'][:i], 'post': s['zh'][i + len(a):], 'ans': a, 'opts': [a] + dis[:2], 'ar': s['ar'], 'py': s['py']})
    chars = [{'c': c['c'], 'py': c['py'], 'ar': c['ar'], 'w': c['c']} for c in B['W']['write']['chars']]
    lq = []
    for q in B['W']['quiz']:
        order = list(range(len(q['opts']))); rng.shuffle(order)
        opts = [{'html': ('<span class="han ltr" lang="zh-CN">%s</span>' % esc(q['opts'][j])) if (q.get('zh') and CJK.search(q['opts'][j])) else esc(q['opts'][j]), 'ok': j == q['a']} for j in order]
        zhq = re.sub(r'(?<![\w])([一-鿿]+[？！。]?)', lambda m: '<span class="han ltr" lang="zh-CN">%s</span>' % m.group(1), esc(q['q']))
        lq.append({'type': 'mc', 'prompt': '<div class="ar-s">%s</div>' % zhq, 'opts': opts, 'wid': [], 'fix': 1,
                   'fb': '<div class="fw"><span>%s</span></div>' % esc(q['opts'][q['a']])})
    acts = ['match', 'listen', 'meaning', 'tone']
    if len(sent) >= 3: acts.append('order')
    if len(fills) >= 3: acts.append('fill')
    if lq: acts.append('lesson')
    acts += ['tonedraw', 'tpr']
    W = B['W']
    if W['sound'].get('builder'): acts.append('pybuild')
    td = []
    for zh in W['sound'].get('tonedraw', []):
        py = syl_of(W, zh)
        if tone(py) != 5: td.append({'zh': zh, 'py': py, 'tone': tone(py)})
    beg = {'tones': C['tones'], 'tonedraw': td, 'tpr': W['tpr'], 'builder': W['sound'].get('builder', []), 'classx': B['classx']}
    d = {'vocab': vocab, 'tokpy': tokpy, 'dlg': dlg, 'txt': txt, 'sent': sent, 'fill': fills, 'chars': chars,
         'spk': {'N': {'n': 'المشهد', 'a': '景'}, 'S': {'n': 'أ', 'a': '甲'}, 'X': {'n': 'ب', 'a': '乙'}},
         'pitch': {'S': 1.0, 'X': 0.9, 'N': 1.0}, 'acts': acts, 'lq': lq, 'gram': '', 'disc': [], 'minc': 12, 'hw': 1, 'beg': beg}
    return d

def sound_html(C, W, B):
    S = W['sound']; h = ''
    h += '<div class="sec-h"><h2>النطق 🔊</h2><p>%s</p></div>' % esc(S['formula']['ar'])
    ex = S['formula'].get('ex')
    if ex:
        h += '<div class="card bg-formula"><div class="bg-parts" dir="ltr"><span>%s</span><b>+</b><span>%s</span><b>+</b><span>%s</span><b>=</b><span class="big">%s</span></div><div class="mut">%s</div></div>' % (
            esc(ex['parts'][0]), esc(ex['parts'][1]), esc(ex['parts'][2]), py_html(ex['py']), spk(ex['zh']))
    if S.get('tones'):
        h += '<h3 class="sub-h">النغمات الأربع</h3><div class="bg-tones">'
        for t, tn in zip(S['tones'], C['tones']):
            h += '<div class="card bg-tone">%s<div class="py ltr big">%s</div><div class="han ltr" lang="zh-CN">%s</div><div class="mut">%s · %s</div>%s</div>' % (
                contour_svg(tn['pts'], 'c%d' % tn['n']), py_html(t['py']), esc(t['zh']), esc(t['ar']), esc(tn['shape']), spk(t['zh']))
        h += '</div>'
    if S.get('neutral'): h += '<p class="mut bg-note">%s</p>' % esc(S['neutral']['ar'])
    if S.get('sets'):
        h += '<h3 class="sub-h">أصوات جديدة</h3><div class="bg-sets">'
        for t in S['sets']:
            h += '<div class="card bg-set"><div class="bg-parts" dir="ltr"><span>%s</span><b>+</b><span>%s</span></div><div class="py ltr big">%s</div><div class="han ltr" lang="zh-CN">%s</div><div class="mut">%s</div>%s</div>' % (
                esc(t['init']), esc(t['fin']), py_html(t['py']), esc(t['zh']), esc(t['ar']), spk(t['zh']))
        h += '</div>'
    if S.get('neutrals'):
        h += '<h3 class="sub-h">النغمة الخفيفة</h3><div class="card"><div class="qa" style="margin-top:0">' + ''.join(
            '<div class="m">%s<div class="t"><span class="z" dir="ltr">%s</span><span class="mut py" dir="ltr">%s</span><span>%s</span></div></div>' % (spk(t['zh'], 'sm'), esc(t['zh']), esc(t['py']), esc(t['ar'])) for t in S['neutrals']) + '</div></div>'
    c = S.get('change')
    if c:
        h += '<h3 class="sub-h">تغيّر النغمة الثالثة</h3><div class="card"><div class="bg-change" dir="ltr"><span class="han" lang="zh-CN">%s</span><span class="mut">كتابةً</span><b>%s</b><span class="mut">نطقاً</span><b>%s</b></div><p class="mut">%s</p>%s%s</div>' % (
            esc(c['zh']), py_html(c['written']), py_html(c['said']), esc(c['ar']), spk(c['zh'], 'sm'),
            ('<p class="mut" style="margin-top:8px"><span class="han" lang="zh-CN">%s</span> <span class="py ltr">%s</span> · %s</p>' % (esc(c['extra']['zh']), py_html(c['extra']['py']), esc(c['extra']['ar']))) if c.get('extra') else '')
    if S.get('pairs'):
        h += '<h3 class="sub-h">اسمع وفرّق</h3><div class="card"><div class="qa" style="margin-top:0">' + ''.join(
            '<div class="m"><div class="t bg-pair" dir="ltr"><span class="py">%s</span> %s <span class="mut">/</span> <span class="py">%s</span> %s</div></div>' % (
                py_html(p['a']['py']), spk(p['a']['say'], 'sm'), py_html(p['b']['py']), spk(p['b']['say'], 'sm')) for p in S['pairs']) + '</div></div>'
    return h

def cards_html(C, W, B):
    h = ''
    cu = W['culture']
    h += '<h3 class="sub-h">🏮 لمحة ثقافية: %s</h3><div class="card bg-culture">' % esc(cu['title'])
    for ln in cu['lines']:
        h += '<p>%s</p>' % esc(ln['ar'])
        if ln.get('zh'): h += '<p class="bg-zhline"><span class="han ltr" lang="zh-CN" style="font-size:24px">%s</span> %s<br><span class="py ltr mut">%s</span> <span class="mut">%s</span></p>' % (esc(ln['zh']), spk(ln['zh'], 'sm'), esc(ln['py']), esc(ln.get('tr', '')))
    h += '</div>'
    pw = W['pairwork']
    h += '<h3 class="sub-h">💬 %s</h3><div class="card bg-pair-card"><div class="qa" style="margin-top:0">' % esc(pw['title']) + ''.join(
        '<div class="m">%s<div class="t"><span class="z" dir="ltr">%s</span><span class="mut py" dir="ltr">%s</span><span>%s</span></div></div>' % (spk(k['zh'], 'sm'), esc(k['zh']), esc(k['py']), esc(k['ar'])) for k in pw['keys']) + '</div><p class="bg-scenario"><b>الموقف:</b> %s</p></div>' % esc(pw['scenario'])
    hw = W['homework']
    h += '<h3 class="sub-h">🏠 %s</h3><div class="card bg-home"><p>%s</p><p class="mut">لا يوجد تسجيل أو رفع في الموقع: أرسل التسجيل في مجموعة الدورة على واتساب أو تيليجرام.</p></div>' % (esc(hw['title']), esc(hw['ar']))
    return h

def presenter_data(C, W, B):
    """JSON for beg-present.js: everything is already parsed (tokens with pinyin)"""
    W2 = json.loads(json.dumps({k: v for k, v in W.items() if k not in ('lex',)}, ensure_ascii=False))
    W2['dialogues'] = [{'title': d['title'], 'lines': [{'who': l['who'], 'zh': l['zh'], 'py': l['py'], 'ar': l['ar'], 'tok': [[t.get('zh') or t['p'], t.get('py', '')] for t in l['tok']]} for l in d['lines']]} for d in B['dlgs']]
    W2['sentences'] = [{'zh': s['zh'], 'py': s['py'], 'ar': s['ar']} for s in B['sents']]
    W2['vocab'] = [{'zh': v['zh'], 'py': v['py'], 'ar': v['ar'], 'note': v.get('note', '')} for v in B['vocab']]
    return {'course': C['course'], 'agenda': C['agenda'], 'axes': C['axes'], 'tones': C['tones'], 'strokes': C['strokes'], 'week': W2,
            'weeks': [{'no': w['no'], 'ar': w['ar'], 'zh': w['zh'], 'soon': bool(w.get('soon')), 'file': w.get('file')} for w in C['weeks']]}

def review_md(C, built):
    L = ['# دورة المبتدئين: مراجعة النصوص العربية', '',
         'ملف مُولَّد من `tools/course/beginners.json` (لا تعدّله يدوياً). ضع علامة ✗ أمام أي سطر يحتاج تصحيحاً واكتب البديل. النصوص الصينية والبينيين مأخوذة من خطة الدورة كما هي.', '']
    L += ['## عام (لكل الأسابيع)', '', '### المحاور الستة', ] + ['- %s %s' % (a['icon'], a['ar']) for a in C['axes']] + ['', '### أقسام الحصة (جدول الدقائق)'] + ['- %s %s (%d–%d)' % (a['icon'], a['ar'], a['from'], a['to']) for a in C['agenda']] + ['']
    for w in C['weeks']:
        if w.get('soon'): continue
        L += ['## الأسبوع %s: %s (%s)' % (w['n'], w['ar'], w['zh']), '', '### العنوان والوصف', '- %s' % w['ar'], '- %s' % w['desc'], '']
        def sec(title, items):
            if not items: return
            L.append('### ' + title)
            for x in items: L.append('- ' + x)
            L.append('')
        wr = w['write']
        sec('👋 الافتتاح', [w['open']['greet']['ar']])
        sec('معاني الكلمات عند الضغط عليها (قاموس الحوار)', ['%s: %s' % (k, v) for k, v in w.get('lex', {}).items()])
        sec('✍ الحروف والرموز', ['%s' % wr['intro']] + ['خط %s %s: %s' % (s['zh'], s['py'], s['ar']) for s in C['strokes']] + ['%s %s: %s · القصة: %s' % (c['c'], c['py'], c['ar'], c['story']) for c in wr['chars']] +
            ['%s %s: %s (تعرّف فقط)' % (c['c'], c['py'], c['ar']) for c in wr.get('recog', [])] +
            ([wr['components']['ar']] + ['مكوّن %s: %s (%s)' % (p['c'], p['ar'], p['ex']) for p in wr['components']['parts']] if wr.get('components') else []) +
            (['حقيقة ممتعة: %s' % wr['funfact']['title']] + ['مرحلة: %s' % s for s in wr['funfact']['stages']] if wr.get('funfact') else []))
        so = w['sound']
        sec('🔊 النطق', [so['formula']['ar']] + ['%s %s: %s' % (t['zh'], t['py'], t['ar']) for t in so.get('tones', [])] + ([so['neutral']['ar']] if so.get('neutral') else []) +
            ['%s %s: %s' % (t['zh'], t['py'], t['ar']) for t in so.get('sets', []) + so.get('neutrals', [])] + [so['change']['ar']] + ([so['change']['extra']['ar']] if so['change'].get('extra') else []) +
            ['%s' % t['ar'] for t in C['tones']] + ['%s' % t['shape'] for t in C['tones']])
        sec('🏫 لغة الفصل', ['%s %s: %s' % (c['zh'], c['py'], c['ar']) for c in w['class']] + ['أمر: %s %s: %s · %s' % (t['zh'], t['py'], t['ar'], t['do']) for t in w['tpr']])
        sec('👂 الاستماع', sum([['حوار: ' + d['title']] + ['%s: %s' % (l['w'].replace('|', ' '), l['ar']) for l in d['lines']] for d in w['dialogues']], []))
        sec('💬 التواصل', ['%s %s: %s' % (v['zh'], v['py'], v['ar']) + (' (' + v['note'] + ')' if v.get('note') else '') for v in w['vocab']] +
            [w['pairwork']['title']] + ['%s %s: %s' % (k['zh'], k['py'], k['ar']) for k in w['pairwork']['keys']] + [w['pairwork']['scenario']] + ['جملة للترتيب: %s' % s['ar'] for s in w['sentences']])
        cu = w['culture']
        sec('🏮 لمحة ثقافية', [cu['title']] + [l['ar'] + ((' · ' + l['tr']) if l.get('tr') else '') for l in cu['lines']])
        sec('🏠 الواجب', [w['homework']['title'], w['homework']['ar']])
        sec('📝 الاختبار السريع', sum([['%s' % q['q']] + ['  %s %s' % ('✓' if i == q['a'] else '·', o) for i, o in enumerate(q['opts'])] for q in w['quiz']], []))
        sec('واجهة المنصة (نصوص ثابتة)', ['وضع المحاضرة', 'وضع الطالب', 'عند مشاركة الشاشة فعّل Share computer sound في Zoom'])
        if built.get(w['no']) and built[w['no']].get('pinyin_doubts'):
            L.append('### ملاحظات البينيين (فحص آلي، لا تصحيح)')
            for x in built[w['no']]['pinyin_doubts']: L.append('- ' + x)
            L.append('')
    return '\n'.join(L) + '\n'

def pinyin_doubts(W, B):
    """compare the data's pinyin with pypinyin (a reading aid only: tone sandhi and neutral tones differ legitimately)"""
    try:
        from pypinyin import lazy_pinyin, Style
    except Exception:
        return ['pypinyin غير متاح: لم يُجرَ الفحص']
    out = []
    def norm(s): return re.sub(r'[\s·,.!?？！，。…]', '', s).lower()
    def bare(s):
        import unicodedata
        return ''.join(c for c in unicodedata.normalize('NFD', norm(s)) if not unicodedata.combining(c) or c == '\u0308').replace('ü', 'u')
    tone_only = []
    items = [(v['zh'], v['py']) for v in W['vocab'] if '…' not in v['zh']] + [(c['zh'], c['py']) for c in W['class']] + [(t['c'], t['py']) for t in W['write']['chars'] + W['write'].get('recog', [])]
    for d in B['dlgs']:
        for l in d['lines']:
            for t in l['tok']:
                if 'zh' in t: items.append((t['zh'], t['py']))
    seen = set()
    for zh, py in items:
        if (zh, py) in seen: continue
        seen.add((zh, py))
        ref = ''.join(lazy_pinyin(zh, style=Style.TONE))
        if norm(ref) != norm(py):
            if bare(ref) == bare(py): tone_only.append('%s: %s (pypinyin: %s)' % (zh, py, ref))
            else: out.append('⚠ %s: في الملف %s، pypinyin يعطي %s (الحروف مختلفة: يحتاج مراجعة)' % (zh, py, ref))
    if tone_only:
        out.append('اختلافات في النغمة فقط (متوقعة: نغمة خفيفة أو تغيّر النغمة، والملف هو المعتمد): ' + ' · '.join(tone_only))
    if not out: out.append('لا ملاحظات')
    return out

def make(week_no, C, rng):
    W = next(w for w in C['weeks'] if w['no'] == week_no)
    B = build_week(C, W, rng); B['W'] = W
    B['pinyin_doubts'] = pinyin_doubts(W, B)
    D = student_data(C, W, B, rng)
    D['gram'] = sound_html(C, W, B) + cards_html(C, W, B)
    tpl = open(os.path.join(LSN3, 'tpl.html'), encoding='utf8').read()
    weeks = [w for w in C['weeks'] if not w.get('soon')]
    i = [w['no'] for w in weeks].index(week_no)
    def card(cls, href, small, label): return '<a class="%s" href="%s"><small>%s</small><b>%s</b></a>' % (cls, href, small, label)
    parts = []
    if i > 0: parts.append(card('zh-prev', weeks[i - 1]['file'], 'الأسبوع السابق', 'الأسبوع %s · %s' % (weeks[i - 1]['n'], esc(weeks[i - 1]['ar']))))
    if i + 1 < len(weeks): parts.append(card('zh-next', weeks[i + 1]['file'], 'الأسبوع التالي', 'الأسبوع %s · %s' % (weeks[i + 1]['n'], esc(weeks[i + 1]['ar']))))
    else: parts.append(card('zh-next', 'index.html#beg', 'أنهيت آخر أسبوع متاح حالياً', 'العودة إلى دورة المبتدئين'))
    lnav = '<nav class="zh-lnav" aria-label="التنقل بين الأسابيع">' + ''.join(parts) + '</nav>'
    out = tpl.replace('%%TITLE%%', esc('دورة المبتدئين · الأسبوع %s · %s' % (W['n'], W['ar']))).replace('%%CRS%%', 'beg').replace('%%COURSE%%', 'beg').replace('%%SEAL%%', W['seal'])
    out = out.replace('%%H1%%', 'الأسبوع ' + W['n']).replace('%%SUB%%', esc('%s · %s' % (W['ar'], W['zh']))).replace('%%GTAB%%', 'النطق').replace('%%KEY%%', W['key']).replace('%%LNAV%%', lnav)
    xq = open(os.path.join(HERE, 'x_quiz.js'), encoding='utf8').read().rstrip('\n')
    xe = open(os.path.join(HERE, 'x_events.js'), encoding='utf8').read().rstrip('\n')
    xd = "CLASSX=(D.beg&&D.beg.classx)||[];"
    for k, v in (('DATA', xd), ('GRAMMAR', ''), ('WRITING', ''), ('QUIZ', xq), ('EVENTS', xe)): out = out.replace('%%X_' + k + '%%', v)
    out = out.replace('%%DATA%%', json.dumps(D, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/'))
    pdata = json.dumps(presenter_data(C, W, B), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    foot = '  <footer class="cfoot"><span dir="ltr">© 2026 Mahmod Alsideig · <span lang="zh">大漠老师</span> · All rights reserved. Content is for personal learning only and may not be copied or republished without permission.</span></footer>\n'
    assert out.count('</main>') == 1
    out = out.replace('</main>', '</main>\n' + foot, 1)
    out = out.replace('<link rel="stylesheet" href="zh-ui.css">', '<link rel="stylesheet" href="zh-ui.css">\n<link rel="stylesheet" href="beg-present.css">', 1)
    out = out.replace('<script src="zh-ui.js" defer></script>', '<script src="zh-ui.js" defer></script>\n<script src="beg-present.js" defer></script>', 1)
    assert 'beg-present.css' in out and 'beg-present.js' in out
    out = out.rstrip('\n') + '\n<script type="application/json" id="beg-data">' + pdata + '</script>\n'
    fn = W['file']
    open(fn, 'w', encoding='utf8').write(out)
    print(fn, len(out), 'vocab', len(D['vocab']), 'dlg', len(D['dlg']), 'sent', len(D['sent']), 'fill', len(D['fill']), 'lq', len(D['lq']), 'acts', ','.join(D['acts']))
    return B

if __name__ == '__main__':
    C = json.load(open(DATA, encoding='utf8'))
    built = {}
    for w in C['weeks']:
        if w.get('soon'): continue
        built[w['no']] = make(w['no'], C, random.Random(20260100 + w['no']))
    open('beginners-review.md', 'w', encoding='utf8').write(review_md(C, built))
