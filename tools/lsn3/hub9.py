import sys,json,re,importlib
sys.path.insert(0,'.')
import core2,gcm
H='../hub.html'
h=open(H,encoding='utf8').read()
i=h.index('var VOCAB=[');j=h.index('];',i)+1
cur=json.loads(h[i+len('var VOCAB='):j])
have={w['zh'] for w in cur}
new=[];skipped=[]
for n,mod in ((9,'g9'),(10,'g10')):
    m=importlib.import_module(mod);core2.addw([t['zh'] for t in m.L['terms']])
    for t in m.L['terms']:
        if t['zh'] in have: skipped.append((n,t['zh']));continue
        have.add(t['zh'])
        ex=t['ex']
        if isinstance(ex,str):
            z,a=ex.split('｜',1);ex=[z,core2.py(z),a]
        elif ex: ex=list(ex)
        py=m.L.get('pyfix',{}).get(t['zh']) or t['py']
        new.append({"zh":t['zh'],"py":py,"ar":t['ar'],"note":"","ex":ex or None,"sup":0,"l":n})
print(len(new),'new; skipped',skipped)
cur2=new+cur  # newest first like existing order (lesson 8 first)
h=h[:i]+'var VOCAB='+json.dumps(cur2,ensure_ascii=False)+h[j:]
def rep(old,new_,cnt=1):
    global h
    assert h.count(old)==cnt,(old[:60],h.count(old))
    h=h.replace(old,new_)
rep(" {n:'八',t:'الدرس الثامن · 今天几号',d:'التاريخ والأيام وعيد الميلاد',url:'lesson-8.html'}\n];"," {n:'八',t:'الدرس الثامن · 今天几号',d:'التاريخ والأيام وعيد الميلاد',url:'lesson-8.html'},\n {n:'九',t:'الدرس التاسع · 你今天有什么安排',d:'الساعة والبرنامج اليومي: 先…然后…',url:'lesson-9.html'},\n {n:'十',t:'الدرس العاشر · 这个星期天你忙不忙',d:'الصفات وأسئلة 忙不忙 و 一下 و 一点儿',url:'lesson-10.html'}\n];")
rep("(crs==='cult'||crs==='prac'||crs==='lis'||crs==='biz'?'':'<div class=\"course soon\"><div class=\"n\">九</div><div><b>الدرس التاسع</b><span class=\"mut\">قريباً</span></div><span></span></div>')","''")
rep("[0,6,7,8]).map","[0,6,7,8,9,10]).map")
open(H,'w',encoding='utf8').write(h)
