"""Name check: the English name is "Mahmod Alsideig" (no "Dr.") everywhere.   python3 tools/lsn3/t_name.py     (run from the repo root)
No text file of the repo (pages, generators, templates, scripts, docs, data) contains the English name with the old title (the word "Dr", with or without the dot, directly before the first name); the footer of the home page and of the
culture lessons reads "© 2026 Mahmod Alsideig · 大漠老师 · All rights reserved." followed by the unchanged no-copy line; the Arabic name and the Chinese name are still there."""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bad = []; files = 0
for d, ds, fs in os.walk(ROOT):
    ds[:] = [x for x in ds if x not in ('.git', 'node_modules', 'screenshots', '__pycache__')]
    for f in fs:
        if not f.endswith(('.html', '.js', '.css', '.md', '.py', '.json', '.txt', '.sh', '.yml', '.yaml', '.svg')): continue
        files += 1
        t = open(os.path.join(d, f), encoding='utf8', errors='replace').read()
        if f != 't_name.py' and re.search(r'Dr\.?\s*' + 'Mah' + 'mod', t, re.I): bad.append(os.path.relpath(os.path.join(d, f), ROOT))
print('text files scanned: %d, files with the old title: %s' % (files, bad)); ok = not bad
FOOT = '© 2026 Mahmod Alsideig · '
NOCOPY = 'Content is for personal learning only and may not be copied or republished without permission.'
for page in ['index.html', 'cult-1.html', 'cult-2.html', 'cult-3.html', 'cult-4.html']:
    t = open(os.path.join(ROOT, page), encoding='utf8').read()
    good = FOOT in t and '大漠老师</span> · All rights reserved.' in t and NOCOPY in t and 'Dr.' not in t[t.index('© 2026'):t.index('© 2026') + 80]
    print('%-12s footer reads "© 2026 Mahmod Alsideig · 大漠老师 · All rights reserved." + the no-copy line: %s' % (page, good)); ok = ok and good
t = open(os.path.join(ROOT, 'lesson-10.html'), encoding='utf8').read()
ar = 'الصديق' in t; print('the Arabic name is untouched (lesson-10): %s' % ar); ok = ok and ar
print('all passed' if ok else 'FAILED'); sys.exit(0 if ok else 1)
