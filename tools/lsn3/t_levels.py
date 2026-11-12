"""Data test for tools/levels.json (the study-plan structure the hub is generated from).
    cd tools/lsn3 && python3 t_levels.py            (no browser, no jieba needed)
Checks: valid structure and settings; every course id used by a level exists; a course sits in exactly one place; every course has
lessons (own or lessons_from); every listed lesson file exists and its storage key is the page's own KEY; no empty level, no
placeholder/'coming soon' content; Arabic titles present; the lesson titles agree with order.py (the static prev/next table);
lesson numbers match their file names. Adding a level/course/lesson to levels.json must keep this passing without code edits."""
import json, os, re, sys
sys.path.insert(0, '.')
ROOT = os.path.abspath('../..')
doc = json.load(open('../levels.json', encoding='utf8'))
fails = 0
def ok(name, cond, extra=''):
    global fails
    print(('ok   ' if cond else 'FAIL ') + name + ((' ' + str(extra)) if extra and not cond else ''))
    if not cond: fails += 1
C = doc['courses']
ok('schema 1 and the expected top-level keys', doc.get('schema') == 1 and {'levels', 'extra', 'courses', 'settings'} <= set(doc))
ok('settings are positive integers', all(isinstance(doc['settings'].get(k), int) and doc['settings'][k] > 0 for k in ('daily_goal', 'done_at')) and doc['settings']['done_at'] <= 100)
ns = [l['n'] for l in doc['levels']]
ok('level numbers are unique, ascending, within 1..8', ns == sorted(set(ns)) and all(1 <= n <= 8 for n in ns), ns)
ok('every level has Arabic title and sub (non-empty, Arabic letters)', all(re.search(r'[؀-ۿ]', l.get('title', '')) and re.search(r'[؀-ۿ]', l.get('sub', '')) for l in doc['levels']))
ok('extra tracks have an Arabic title', bool(re.search(r'[؀-ۿ]', doc['extra']['title'])))
placed = [c for l in doc['levels'] for c in l['courses']] + doc['extra']['courses']
ok('every placed course id exists in courses', all(c in C for c in placed), [c for c in placed if c not in C])
ok('a course is placed exactly once (no duplicates, none left out)', sorted(placed) == sorted(C), (sorted(placed), sorted(C)))
ok('no empty level and no empty extra section', all(l['courses'] for l in doc['levels']) and bool(doc['extra']['courses']))
def lessons(cid):
    c = C[cid]
    return c['lessons'] if 'lessons' in c else C[c['lessons_from']]['lessons']
ok('lessons_from points at a course that has its own lessons', all(('lessons' in c) != ('lessons_from' in c) and ('lessons_from' not in c or 'lessons' in C[c['lessons_from']]) for c in C.values()))
ok('every course has at least one lesson (no placeholder courses)', all(len(lessons(c)) > 0 for c in C))
ok('course names, books and covers are non-empty; colour is 1..6', all(c['name'] and c['book'] and c['cover'] and 1 <= c['color'] <= 6 for c in C.values()))
files, keys, bad = [], [], []
for cid, c in C.items():
    for l in c.get('lessons', []):
        path = os.path.join(ROOT, l['file'])
        if not os.path.exists(path): bad.append(('missing', l['file'])); continue
        page = open(path, encoding='utf8').read()
        m = re.search(r"var KEY='([^']+)'", page)
        if not m or m.group(1) != l['key']: bad.append(('key', l['file'], l['key'], m and m.group(1)))
        if str(l['no']) != re.search(r'-(\d+)\.html$', l['file']).group(1): bad.append(('number', l['file']))
        if not (l['n'] and l['title'] and l['desc'] and ' · ' in l['title']): bad.append(('text', l['file']))
        files.append(l['file']); keys.append(l['key'])
ok('every listed lesson file exists, its storage key is the page\'s own KEY, number and texts are filled', not bad, bad)
ok('no lesson file or storage key is listed twice', len(set(files)) == len(files) and len(set(keys)) == len(keys))
ok('every lesson page of the site is listed (no page is left out of the hub)',
   sorted(f for f in os.listdir(ROOT) if re.match(r'(lesson|prac|lis|biz|cult)-\d+\.html$', f)) == sorted(files))
ok('lessons within a course are in ascending order', all([l['no'] for l in c.get('lessons', [])] == sorted(l['no'] for l in c.get('lessons', [])) for c in C.values()))
import order
mism = []
for cid, course in (('gram', 'gram'), ('prac', 'prac'), ('lis', 'lis'), ('biz', 'biz'), ('cult', 'cult')):
    want = {n: t for n, t in order.LESSONS[course]}
    for l in C[cid]['lessons']:
        zh = l['title'].split(' · ', 1)[1].replace('？', '').replace('?', '').strip()
        if zh != want[l['no']].replace('？', '').replace('?', '').strip(): mism.append((cid, l['no'], zh, want[l['no']]))
    if sorted(want) != [l['no'] for l in C[cid]['lessons']]: mism.append((cid, 'lesson set differs from order.py'))
ok('lesson titles and lesson sets agree with order.py', not mism, mism)
txt = open('../levels.json', encoding='utf8').read()
ok('no placeholder wording anywhere ("coming soon" / قريباً / placeholder)', not re.search(r'قريباً|coming soon|placeholder|TODO', txt, re.I))
print('all passed' if not fails else '%d FAILED' % fails)
sys.exit(1 if fails else 0)
