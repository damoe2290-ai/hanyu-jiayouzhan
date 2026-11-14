"""Hub data: put tools/levels.json (plus the real size of every lesson) into the hub template.

    cd tools/lsn3 && python3 hubgen.py          (run after the lessons are built; rebuild_all.sh does it)

Reads  ../levels.json   the study-plan structure (levels, courses, lessons; see tools/README.md)
       <built lesson pages in the current directory>   to measure each lesson: vocabulary words, dialogue lines (culture:
                      topics) and activity names. The hub needs these to compute the same completion percentage that each
                      lesson page shows in its own progress bar (see progress() in tpl.html / tplt.html).
Writes ../hub.html  with %%LEVELS%% replaced by the JSON. (rebuild_all.sh runs this in its temporary copy, so the
                      tracked tools/hub.html keeps the placeholder.)

Nothing is hard-coded per lesson: adding a lesson, course or level to levels.json is enough, as long as the lesson page exists.
"""
import json, os, re, sys
sys.path.insert(0, '.')
import jslit

def page_D(path):
    s = open(path, encoding='utf8').read()
    m = re.search(r'^var D=(.*);$', s, re.M)
    return json.loads(m.group(1)) if m else {}

def size_of(file):
    """{'v': words, 'd': dialogue lines (culture: topics), 'acts': [activity names], 'topics': True for culture pages}"""
    D = page_D(file)
    if 'vocab' in D:                      # generated lesson (and culture): everything is in D
        culture = 'nt' in D
        return {'v': len(D['vocab']), 'd': D['nt'] if culture else len(D['dlg']), 'acts': D['acts'], 'topics': culture}
    num = re.search(r'-(\d+)\.html$', file).group(1)       # frozen hand-built lesson (lessons 6-8): data lives in legacy/g<N>.data.js
    snip = open('legacy/g%s.data.js' % num, encoding='utf8').read()
    return {'v': len(jslit.var(snip, 'VOCAB')), 'd': len(jslit.var(snip, 'DLG')), 'acts': jslit.var(snip, 'ACTS'), 'topics': False}

def sents_of(file):
    """The lesson's own sentences (tokens, text, pinyin, Arabic) for the hub's sentence builder: nothing is invented.
    Generated lessons keep them in D['sent']; the frozen lessons 6-8 in SENT of legacy/g<N>.data.js; culture lessons have none."""
    D = page_D(file)
    if 'vocab' in D:
        raw = D.get('sent') or []
    else:
        num = re.search(r'-(\d+)\.html$', file).group(1)
        raw = jslit.var(open('legacy/g%s.data.js' % num, encoding='utf8').read(), 'SENT')
    return [{'t': x['tokens'], 'zh': x['zh'], 'py': x.get('py', ''), 'ar': x.get('ar', '')} for x in raw if x.get('tokens') and len(x['tokens']) >= 2]

def beg_vocab(path='../course/beginners.json'):
    """words of the beginners course for the hub's dictionary / review / games (same shape as the other courses' lists; l = week number)"""
    if not os.path.exists(path): return []
    src = json.load(open(path, encoding='utf8'))
    out, seen = [], set()
    for w in src['weeks']:
        if w.get('soon'): continue
        for v in w['vocab'] + [{'zh': c['zh'], 'py': c['py'], 'ar': c['ar'], 'note': 'عبارة الفصل'} for c in w['class']]:
            if v['zh'] in seen or '…' in v['zh']: continue
            seen.add(v['zh'])
            ex = ['', '', '']
            out.append({'zh': v['zh'], 'py': v['py'], 'ar': v['ar'], 'note': v.get('note', ''), 'ex': ex, 'sup': 0, 'l': w['no']})
    return out

def build(levels_path='../levels.json'):
    doc = json.load(open(levels_path, encoding='utf8'))
    for cid, c in doc['courses'].items():
        for l in c.get('lessons', []):
            if l.get('soon'): continue      # an upcoming week of the beginners course: no page yet
            l['size'] = size_of(l['file'])
            l['sents'] = sents_of(l['file'])
    doc['begVocab'] = beg_vocab()
    return doc

if __name__ == '__main__':
    doc = build()
    hub = open('../hub.html', encoding='utf8').read()
    assert hub.count('%%LEVELS%%') == 1, 'hub.html must contain %%LEVELS%% exactly once'
    hub = hub.replace('%%LEVELS%%', json.dumps(doc, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/'))
    open('../hub.html', 'w', encoding='utf8').write(hub)
    n = sum(len(c.get('lessons', [])) for c in doc['courses'].values())
    print('hubgen: %d levels, %d courses, %d lessons measured' % (len(doc['levels']), len(doc['courses']), n))
