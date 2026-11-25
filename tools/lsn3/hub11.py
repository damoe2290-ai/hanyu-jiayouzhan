"""One-off patch of tools/hub.html for lessons 11-15 (same method as hub9.py): add the lessons' vocabulary to the hub
dictionary / spaced-review list (VOCAB, newest first, field l = lesson number) and the lesson filter buttons of the
Grammar course. Run once from tools/lsn3:  python3 hub11.py   (re-running skips words already present)."""
import sys,json,importlib
sys.path.insert(0,'.')
import core2,gcm
H='../hub.html'
h=open(H,encoding='utf8').read()
i=h.index('var VOCAB=[');j=h.index('];',i)+1
cur=json.loads(h[i+len('var VOCAB='):j])
have={w['zh'] for w in cur}
new=[];skipped=[]
for n in (11,12,13,14,15):
    m=importlib.import_module('g%d'%n);core2.addw([t['zh'] for t in m.L['terms']])
    for t in m.L['terms']:
        if t['zh'] in have: skipped.append((n,t['zh']));continue
        have.add(t['zh'])
        ex=t['ex']
        if isinstance(ex,str):
            z,a=ex.split('｜',1);ex=[z,core2.py(z),a]
        elif ex: ex=list(ex)
        py=m.L.get('pyfix',{}).get(t['zh']) or t['py']
        new.append({"zh":t['zh'],"py":py,"ar":t['ar'],"note":"","ex":ex or None,"sup":0,"l":n})
print(len(new),'new; skipped (already in the dictionary):',skipped)
cur2=sorted(new,key=lambda w:-w['l'])+cur   # newest lesson first, like the existing order
h=h[:i]+'var VOCAB='+json.dumps(cur2,ensure_ascii=False)+h[j:]
old="(crs==='biz')?[0,4,5,6]:[0,6,7,8,9,10]).map"
assert h.count(old)==1
h=h.replace(old,"(crs==='biz')?[0,4,5,6]:[0,6,7,8,9,10,11,12,13,14,15]).map")
open(H,'w',encoding='utf8').write(h)
