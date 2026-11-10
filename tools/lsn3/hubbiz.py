import sys,json,importlib
sys.path.insert(0,'.')
import core2
H='../hub.html'
h=open(H,encoding='utf8').read()
seen={};out=[]
for n in (4,5,6):
    m=importlib.import_module('b%d'%n); core2.addw([t['zh'] for t in m.L['terms']])
    for t in m.L['terms']:
        if t['zh'] in seen: continue
        seen[t['zh']]=1
        ex=t['ex']
        if isinstance(ex,str):
            z,a=ex.split('｜',1); ex=[z,core2.py(z),a]
        elif ex: ex=list(ex)
        out.append({"zh":t['zh'],"py":t['py'],"ar":t['ar'],"note":"","ex":ex or None,"sup":0,"l":n})
print(len(out))
def rep(old,new,cnt=1):
    global h
    assert h.count(old)==cnt,(old,h.count(old))
    h=h.replace(old,new)
BT=['我想约个时间和您见面','为了大家的健康干杯','还有其他颜色吗']
BD=['تحديد المواعيد وتغييرها وإلغاؤها','المآدب والدعوات وكلمة النخب','التسوق والتخفيضات والفواتير']
arr='var BIZ=[\n'+',\n'.join(" {n:'%s',t:'الدرس %s · %s',d:'%s',url:'biz-%d.html'}"%(['四','五','六'][i],['الرابع','الخامس','السادس'][i],BT[i],BD[i],4+i) for i in range(3))+'\n];\n'
rep('var CULT=[',arr+'var CULT=[')
rep('var LB={gram:LESSONS,fl:LESSONS,cult:CULT,prac:PRAC,lis:LIS};','var LB={gram:LESSONS,fl:LESSONS,cult:CULT,prac:PRAC,lis:LIS,biz:BIZ};')
rep('var VOCAB_CULT=','var VOCAB_BIZ='+json.dumps(out,ensure_ascii=False)+';\nvar VOCAB_CULT=')
rep("lis:VOCAB_LIS}","lis:VOCAB_LIS,biz:VOCAB_BIZ}")
rep("S={dues:{gram:{},fl:{},cult:{},prac:{},lis:{}}}","S={dues:{gram:{},fl:{},cult:{},prac:{},lis:{},biz:{}}}")
rep("['gram','fl','cult','prac','lis']","['gram','fl','cult','prac','lis','biz']",3)
rep(" {id:'cult',cv:'中国<br>文化'"," {id:'biz',cv:'商务<br>汉语',t:'اللغة الصينية العملية',s:'《新丝路·中级速成商务汉语1》',total:3,on:1},\n {id:'cult',cv:'中国<br>文化'")
rep("crs==='cult'||crs==='prac'||crs==='lis'","crs==='cult'||crs==='prac'||crs==='lis'||crs==='biz'",2)
rep("(crs==='prac'||crs==='lis')?[0,6,7,8,9,10]","(crs==='prac'||crs==='lis')?[0,6,7,8,9,10]:(crs==='biz')?[0,4,5,6]")
rep("gram|fl|prac|lis|cult","gram|fl|prac|lis|biz|cult")
rep("<button data-open=\"lis:rev\">'+ic('repeat')+'مفردات الاستماع</button>","<button data-open=\"lis:rev\">'+ic('repeat')+'مفردات الاستماع</button><button data-open=\"biz:dict\">'+ic('book')+'قاموس العملية</button><button data-open=\"biz:rev\">'+ic('repeat')+'مفردات العملية</button>")
h=h.replace('--c5:#C2410C','--c5:#C2410C;--c6:#7C3AED').replace('--c5:#F08A5D','--c5:#F08A5D;--c6:#A78BFA')
open(H,'w',encoding='utf8').write(h)
