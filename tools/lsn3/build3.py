import sys,json,re,importlib,random,html as H
sys.path.insert(0,'.')
import core2
from core2 import tk,FIX,tone,NUMS,CJK,pinyin,Style,iscjk
random.seed(11)
def esc(s): return H.escape(str(s),quote=True)
PUN=set('，。、；：！？“”《》（）—·….,;:!?()"\'')
BASE_GL={'我':'أنا','你':'أنتَ/أنتِ','您':'حضرتك (مهذب)','他':'هو','她':'هي','们':'(جمع)','我们':'نحن','你们':'أنتم','他们':'هم','的':'(أداة إضافة)','吗':'(أداة سؤال)','呢':'(أداة سؤال: وأنت؟)','吧':'(أداة اقتراح)','不':'لا','是':'يكون','有':'يملك / يوجد','没有':'ليس لدي','在':'في / يكون في','很':'جداً','好':'جيد','也':'أيضاً','都':'جميعاً','和':'و','这':'هذا','那':'ذلك','这儿':'هنا','那儿':'هناك','哪儿':'أين','什么':'ماذا','谁':'من','哪':'أي','几':'كم','多少':'كم','了':'(أداة إتمام)','太':'جداً','请':'من فضلك','请问':'عفواً (سؤال)','谢谢':'شكراً','对不起':'آسف','没关系':'لا بأس','再见':'إلى اللقاء','去':'يذهب','来':'يأتي','说':'يقول','看':'ينظر','买':'يشتري','想':'يريد','要':'يريد','一':'واحد','二':'اثنان','两':'اثنان','三':'ثلاثة','四':'أربعة','五':'خمسة','六':'ستة','七':'سبعة','八':'ثمانية','九':'تسعة','十':'عشرة','百':'مئة','千':'ألف','个':'وحدة عدّ','岁':'سنة (عمر)','口':'فرد (للعائلة)','家':'منزل / عائلة','人':'شخص','号':'يوم (في الشهر)','月':'شهر','点':'الساعة','分':'دقيقة','钟':'ساعة','上':'صباح/فوق','下':'مساء/تحت','中午':'الظهر','晚上':'المساء','早上':'الصباح','今天':'اليوم','明天':'غداً','昨天':'أمس','现在':'الآن','时候':'وقت','一起':'معاً','可以':'يمكن','怎么样':'كيف','怎么':'كيف','为什么':'لماذا','因为':'لأن','所以':'لذلك','但是':'لكن','还':'ما زال/أيضاً','就':'إذن/فقط','才':'لتوّه','先':'أولاً','再':'ثم / مرة أخرى','真':'حقاً','真是':'حقاً','最':'الأكثر','比较':'نسبياً','非常':'للغاية','学校':'مدرسة','老师':'معلم','学生':'طالب','朋友':'صديق','中国':'الصين','北京':'بكين','汉语':'اللغة الصينية','中文':'اللغة الصينية','吃':'يأكل','喝':'يشرب','给':'يعطي','让':'يدع','叫':'يُدعى','姓':'اسم العائلة','认识':'يعرف','知道':'يعرف','住':'يسكن','工作':'يعمل','学习':'يدرس','做':'يفعل','走':'يمشي','到':'يصل','回':'يعود','等':'ينتظر','找':'يبحث','用':'يستخدم','让我':'دعني','但':'لكن','而':'بينما','或者':'أو','还是':'أم','吧。':'','这么':'هكذا','那么':'إذاً','别':'لا (نهي)','没':'لم','能':'يستطيع','会':'يعرف/سوف','得':'(أداة)','地':'(أداة)','对':'صحيح','错':'خطأ','大':'كبير','小':'صغير','多':'كثير','少':'قليل','高':'طويل','新':'جديد','旧':'قديم'}
ALLT={}
def load_all():
    for c,rng in (('r',range(6,11)),('s',range(6,11))):
        for n in rng:
            m=importlib.import_module('%s%d'%(c,n)); core2.addw([t['zh'] for t in m.L['terms']])
            for t in m.L['terms']: ALLT.setdefault(t['zh'],t['ar'])
load_all()
def gloss(w): return ALLT.get(w) or BASE_GL.get(w,'')
def cap(s): return s[:1].upper()+s[1:] if s else s
def pytok(s):
    toks=tk().lcut(s,HMM=False); T=[]
    for t in toks:
        if len(t)>1 and all(c in NUMS for c in t): T+=list(t)
        else: T.append(t)
    syl=[];ch=[];grp=[]
    prev=''
    for t in T:
        allc=all(CJK.match(c) for c in t)
        if allc:
            items=pinyin(t,style=Style.TONE,errors=lambda x:[x])
            if len(items)!=len(t): allc=False
        if allc:
            idx=[]
            for c,it in zip(t,items):
                idx.append(len(syl));syl.append(it[0]);ch.append(c)
            if t in FIX and (len(t)>1 or prev in ('姓','叫')):
                parts=FIX[t].split(' ')
                syl[idx[0]]=cap(syl[idx[0]])
                if len(parts)>1 and parts[1][:1].isupper() and len(idx)>1: syl[idx[1]]=cap(syl[idx[1]])
            grp.append((t,idx))
        else:
            grp.append((t,None))
        prev=t
    for k,x in enumerate(syl):
        xl=x.lower()
        if xl in('yī','bù') and k+1<len(syl):
            n=tone(syl[k+1])
            if xl=='bù' and n==4: syl[k]='bú'
            elif xl=='yī' and syl[k+1].lower()!='yī' and ch[k+1] not in NUMS and ch[k+1]!='十': syl[k]='yí' if n==4 else 'yì'
    for k in range(2,len(ch)):
        if ch[k]=='了' and ch[k-1] in '不得' and ch[k-2] in '去做来吃办忘完干看听买说写到见': syl[k]='liǎo'
    out=[]
    for t,idx in grp:
        if idx is None: out.append([t])
        else: out.append([t,' '.join(syl[i] for i in idx)])
    return out
def syl_str(zh): return ' '.join(x[1] for x in pytok(zh) if len(x)==2)
def han_html(w,py):
    sy=py.split(' ')
    return ''.join('<span class="t%d">%s</span>'%(tone(sy[i]) if i<len(sy) else 5,esc(c)) for i,c in enumerate(w))
def py_html(py): return ''.join('<span class="t%d">%s</span>'%(tone(s),esc(s)) for s in py.split(' '))
ICSPK='<svg viewBox="0 0 24 24" width="%d" height="%d" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
def spk(t,cls=''): return '<button class="spk %s" data-act="say" data-t="%s" aria-label="استمع">%s</button>'%(cls,esc(t),ICSPK%((36,36) if cls=='big' else (20,20)))
def tokbtn(w,py,ar): return '<button class="tok" data-act="gtok" data-z="%s" data-p="%s" data-a="%s"><span class="py">%s</span><span class="zh">%s</span></button>'%(esc(w),esc(py),esc(ar),py_html(py),han_html(w,py))
def zhline(zh):
    groups=[]
    for x in pytok(zh):
        if len(x)==1:
            if groups: groups[-1]+='<span class="punc">%s</span>'%esc(x[0])
            else: groups.append('<span class="punc">%s</span>'%esc(x[0]))
        else: groups.append(tokbtn(x[0],x[1],gloss(x[0])))
    return '<div class="zhline">'+''.join('<span class="tg">%s</span>'%g for g in groups)+'</div>'
def sentbox(zh,ar):
    say=re.sub(r'[①②③④⑤⑥⑦⑧⑨⑩]\s*','',zh)
    return '<div class="sentbox">'+zhline(zh)+('<div>%s</div>'%esc(ar) if ar else '')+'<div class="tools" style="margin:6px 0 0">'+spk(say,'sm')+'</div></div>'
def sp2(s):
    a=s.split('｜',1); return (a[0],a[1] if len(a)>1 else '')
def tile(zh,ar):
    py=syl_str(zh)
    return '<div class="tile"><span class="han" dir="ltr">%s</span><span class="py" dir="ltr">%s</span><span class="mut">%s</span>%s</div>'%(han_html(zh,py) if py else esc(zh),py_html(py) if py else '',esc(ar),spk(zh,'sm'))
def rowm(zh,ar):
    return '<div class="m">%s<div class="t"><span class="z" dir="ltr">%s</span><span class="mut py" dir="ltr">%s</span><span>%s</span></div></div>'%(spk(zh,'sm'),esc(zh),esc(cap(core2.py(zh))),esc(ar))
def short(zh): return len([c for c in zh if CJK.match(c)])<=4 and not any(c in PUN for c in zh) and ' ' not in zh
def cellhtml(c):
    z,a=sp2(c)
    if a and iscjk(z): return '<div class="han" dir="ltr">%s</div><div class="mut">%s</div>'%(esc(z),esc(a))
    if not a and iscjk(c): return '<div class="han" dir="ltr">%s</div><div class="mut py" dir="ltr">%s</div>'%(esc(c),esc(cap(core2.py(c))))
    return esc(z if not a else z+' '+a)
def render_blocks(blocks):
    out='';i=0
    while i<len(blocks):
        b=blocks[i];nxt=blocks[i+1] if i+1<len(blocks) else None
        if 'p' in b:
            z,a=sp2(b['p'])
            if iscjk(z) and nxt and ('sl' in nxt or 'table' in nxt or 'cards' in nxt) and len([c for c in z if CJK.match(c)])<=16:
                out+='<h4 class="sh2"><span class="han" dir="ltr">%s</span> · %s</h4>'%(esc(z),esc(a))
            elif iscjk(z): out+=sentbox(z,a)
            else: out+='<p style="margin:10px 0 4px">%s</p>'%esc(z if not a or a==z else z)
        elif 'key' in b:
            z,a=sp2(b['key'])
            out+='<div class="card" style="background:var(--accent-soft);border-color:transparent;margin-top:12px"><div class="formula"><span class="fm k">重点</span><b>نقطة مهمة</b></div>'+(sentbox(z,a) if iscjk(z) else '<p>%s</p>'%esc(z))+'</div>'
        elif 'sl' in b:
            tiles=[];rows=[]
            def flush():
                nonlocal out,tiles,rows
                if tiles: out+='<div class="tiles" style="margin-top:8px">'+''.join(tiles)+'</div>';tiles=[]
                if rows: out+='<div class="qa">'+''.join(rows)+'</div>';rows=[]
            for it in b['sl']:
                z,a=sp2(it)
                if ' — ' in z:
                    flush();pz=z.split(' — ')
                    out+='<div class="pair"><div class="tiles">'+''.join(tile(w,'') for w in pz)+'</div><div class="mut" style="text-align:center">%s</div></div>'%esc(a)
                elif short(z):
                    if rows: flush()
                    tiles.append(tile(z,a))
                else:
                    if tiles: flush()
                    rows.append(rowm(z,a))
            flush()
        elif 'table' in b:
            tb=b['table'];out+='<div class="tw"><table><thead><tr>'+''.join('<th>%s</th>'%cellhtml(c) for c in tb['head'])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>%s</td>'%cellhtml(c) for c in r)+'</tr>' for r in tb['rows'])+'</tbody></table></div>'
        elif 'cards' in b:
            out+='<div class="tiles" style="margin-top:8px">'+''.join(tile(c[0],c[1]) for c in b['cards'])+'</div>'
        i+=1
    return out
# ---------- lesson numerals + prev/next navigation (plain <a> links, work without JS) ----------
NZ=['','一','二','三','四','五','六','七','八','九','十'];NA=['','الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر']
def zhspan(t): return '<bdi lang="zh-CN">%s</bdi>'%esc(t)
def series_items(course):
    """[(url, label_html)] for every lesson of a course, in order; labels match the hub's lesson list."""
    import order
    out=[]
    for n,t in order.LESSONS[course]:
        lab=('الدرس %s · %s'%(NA[n],zhspan(t))) if course!='cult' else ('第%s课 · %s'%(NZ[n],zhspan(t)))
        out.append((order.FILES[course]%n,lab))
    return out
def lnav_html(course,items,i):
    """Previous / next lesson block. The last lesson links back to the course list instead of a next lesson."""
    def card(cls,href,small,label): return '<a class="%s" href="%s"><small>%s</small><b>%s</b></a>'%(cls,href,small,label)
    parts=[]
    if i>0: parts.append(card('zh-prev',items[i-1][0],'الدرس السابق',items[i-1][1]))
    if i+1<len(items): parts.append(card('zh-next',items[i+1][0],'الدرس التالي',items[i+1][1]))
    else: parts.append(card('zh-next','index.html#'+course,'أنهيت آخر درس متاح حالياً','العودة إلى قائمة الدروس'))
    return '<nav class="zh-lnav" aria-label="التنقل بين الدروس">'+''.join(parts)+'</nav>'
# ---------- levels challenge (Phase 2): banks for the typed and true/false questions ----------
LV_KINDS={'tf':('zh','py','ar','a'),'type_py':('zh','py','ar'),'type_zh':('py','ar','ans'),'type_sent':('ar','ans'),'type_cloze':('pre','post','ans','ar')}
def _even(lst,k):
    """k items spread evenly over lst, deterministic (no random numbers: that would change other lessons' output)"""
    if len(lst)<=k: return list(lst)
    return [lst[int(i*len(lst)/k)] for i in range(k)]
def lv_banks(vocab,fills,L):
    """Question banks derived from the lesson's own vocabulary, example sentences and fill-in items.
    The browser picks from them at random each session. Manual questions go in the lesson's data file as
    L['lv_extra']=[{'kind':'type_sent','ar':'...','ans':'...'}, ...] (kinds and required fields: LV_KINDS).
    L['lv_pass'] sets the pass rate (default 0.75)."""
    ok=[i for i,v in enumerate(vocab) if v['zh'] and not v['ar'].startswith('(') and len(v['ar'])<=40]
    uniq=lambda i: sum(1 for v in vocab if v['ar']==vocab[i]['ar'])==1
    tf=[]
    for k,i in enumerate(ok):
        v=vocab[i]
        if k%2==0: tf.append({'zh':v['zh'],'py':v['py'],'ar':v['ar'],'a':1,'w':i})
        else:   # false statement: another word's meaning (chosen by position, never the same gloss)
            j=i
            for off in range(max(1,len(ok)//2),len(ok)+1):
                j=ok[(k+off)%len(ok)]
                if vocab[j]['ar']!=v['ar']: break
            tf.append({'zh':v['zh'],'py':v['py'],'ar':vocab[j]['ar'],'a':0,'w':i})
    py=[{'zh':vocab[i]['zh'],'py':vocab[i]['py'],'ar':vocab[i]['ar'],'w':i} for i in ok]
    zh=[{'py':vocab[i]['py'],'ar':vocab[i]['ar'],'ans':vocab[i]['zh'],'w':i} for i in ok if len(vocab[i]['zh'])<=3 and uniq(i)]
    sent=[];seen=set()
    for i,v in enumerate(vocab):
        ex=v.get('ex')
        if not ex or ex[0] in seen: continue
        n=len([c for c in ex[0] if CJK.match(c)])
        if 4<=n<=16: seen.add(ex[0]);sent.append({'ans':ex[0],'py':ex[1],'ar':ex[2],'w':i})
    cloze=[{'pre':f['pre'],'post':f['post'],'ans':f['ans'],'ar':f['ar'],'py':f['py']} for f in fills]
    tf=[x for pair in zip(_even([x for x in tf if x['a']],10),_even([x for x in tf if not x['a']],10)) for x in pair]   # balanced: 10 true, 10 false
    bank={'tf':tf,'py':_even(py,20),'zh':_even(zh,20),'sent':_even(sent,20),'cloze':cloze}
    key={'tf':'tf','type_py':'py','type_zh':'zh','type_sent':'sent','type_cloze':'cloze'}
    for e in L.get('lv_extra',[]):
        k=e.get('kind');assert k in LV_KINDS,('unknown lv_extra kind',k,sorted(LV_KINDS))
        miss=[f for f in LV_KINDS[k] if f not in e];assert not miss,('lv_extra %s needs %s'%(k,miss))
        bank[key[k]].append(dict({f:v for f,v in e.items() if f!='kind'},manual=1))
    bank['pass']=L.get('lv_pass',0.75)
    return bank
SPKEYS=['S','X','L','C','A','Y']
PIT={'S':1.0,'X':0.9,'L':1.1,'C':0.95,'A':1.05,'Y':0.9,'N':1.0}
def avatar(n):
    z=sp2(n)[0]
    return z[-1] if z.startswith('学生') else z[0]
def conv_q(it,vocab):
    t=it['t']
    def optv(o):
        return ('<span class="han ltr" style="font-size:19px">%s</span> <span class="py ltr mut">%s</span>'%(esc(o),esc(cap(core2.py(o)))) if CJK.search(o) else esc(o))
    why='<div>%s</div>'%esc(it['why']) if it.get('why') else ''
    if t=='mcq':
        return {'type':'mc','prompt':'<div class="ar-s">%s</div>'%esc(it['q']),'opts':[{'html':optv(o),'ok':k==it['a']} for k,o in enumerate(it['o'])],'fb':why,'wid':[]}
    if t=='tf':
        q=it['q']
        pr=('<div class="han ltr" style="font-size:26px">%s</div>'%esc(q)) if iscjk(q) else '<div class="ar-s">%s</div>'%esc(q)
        return {'type':'mc','prompt':pr+'<div class="mut">صح أم خطأ؟</div>','opts':[{'html':'صح','ok':bool(it['a'])},{'html':'خطأ','ok':not it['a']}],'fix':1,'fb':why,'wid':[]}
    if t=='listen':
        return {'type':'mc','sp':it['say'],'prompt':'@@SPK@@<div class="mut">%s</div>'%esc(it['q']),'opts':[{'html':optv(o),'ok':k==it['a']} for k,o in enumerate(it['o'])],'fb':'<div class="fw"><span class="han ltr" style="font-size:20px">%s</span></div>'%esc(it['say'])+why,'wid':[]}
    if t=='match':
        return {'type':'match','words':[{'zh':z,'py':syl_str(z),'ar':a} for z,a in it['p']],'wid':[]}
    if t=='order':
        zh=''.join(it['items']);ar=it['q'].split(':',1)[-1].strip()
        for x in it['items']: pass
        return {'type':'order','s':{'tokens':it['items'],'zh':zh,'py':cap(core2.py(zh)),'ar':ar},'wid':[]}
    return None
def cloze_specs(it):
    q=it['q'];ans=it['a'];bank=it.get('bank',[]);parts=q.split('___');out=[]
    for k,a in enumerate(ans):
        pre=''.join(parts[j]+(ans[j] if j<k else '') for j in range(k+1)) if False else ''
        pre=''
        for j in range(k+1): pre+=parts[j]+(ans[j] if j<k else '')
        post=''
        for j in range(k+1,len(parts)): post+=(parts[j] if j==k+1 else '')+('' if j==k+1 else '')
        post=''.join((ans[j-1] if j-1>k else '')+parts[j] for j in range(k+1,len(parts)))
        full=''.join(parts[j]+(ans[j] if j<len(ans) else '') for j in range(len(parts)))
        opts=[a]+[b for b in bank if b!=a]
        opts=opts[:4]
        out.append({'type':'fill','f':{'pre':pre,'post':post,'ans':a,'opts':opts,'ar':'','py':cap(core2.py(full))},'wid':[]})
    return out
def build(L):
    n=L['n'];course=L['course']
    terms=L['terms'];addw=core2.addw([t['zh'] for t in terms])
    vocab=[]
    for t in terms:
        ex=None
        if t['ex']:
            z,a=sp2(t['ex']);ex=[z,cap(core2.py(z)),a]
        vocab.append({'zh':t['zh'],'py':L.get('pyfix',{}).get(t['zh']) or syl_str(t['zh']),'ar':t['ar'],'ex':ex or ['','','']})
    tokpy={}
    def addtok(zh):
        for x in pytok(zh):
            if len(x)==2: tokpy[x[0]]=x[1]
    # dialogues
    spkmap={};spk={'N':{'n':'المشهد','a':'景'}};dlg=[];txt={};gram_secs=[];say_items=[];k=0
    for s in L['sections']:
        bl=s['b']
        hasd=any('dlg' in b for b in bl)
        rest=[]
        if not hasd:
            gram_secs.append((s,bl));continue
        pend=None
        for bi,b in enumerate(bl):
            if 'dlg' in b:
                k+=1;scene=''
                if pend is not None:
                    z,a=sp2(pend)
                    if z.startswith('场景') or z.startswith('情景'):
                        dlg.append({'text':k,'who':'N','zh':z,'ar':a,'tok':[[x[0],x[1],gloss(x[0])] if len(x)==2 else [x[0]] for x in pytok(z)]});addtok(z)
                    else: scene='<p class="mut" style="margin:6px 0">%s</p>'%esc(z)
                    pend=None
                txt[k]={'h':s['ar'],'scene':scene}
                for sp_,ln in b['dlg']:
                    if sp_ not in spkmap:
                        key=SPKEYS[len(spkmap)%len(SPKEYS)];spkmap[sp_]=key;spk[key]={'n':sp2(sp_)[1] or sp2(sp_)[0],'a':avatar(sp_)}
                    z,a=sp2(ln);key=spkmap[sp_]
                    dlg.append({'text':k,'who':key,'zh':z,'ar':a,'tok':[[x[0],x[1],gloss(x[0])] if len(x)==2 else [x[0]] for x in pytok(z)]});addtok(z)
            elif 'p' in b and bi+1<len(bl) and 'dlg' in bl[bi+1]: pend=b['p']
            else: rest.append(b)
        if rest: gram_secs.append(({'h':s['h'],'ar':s['ar']},rest))
    for t in vocab: tokpy[t['zh']]=t['py']
    # sentences
    sents=[];seen=set()
    def add_s(zh,ar):
        zh=re.sub(r'[①②③④⑤⑥⑦⑧⑨⑩]\s*','',zh).strip()
        if zh in seen or not ar or not zh or not iscjk(zh): return
        if re.search(r'[A-Za-z0-9]',zh): return
        toks=[x for x in pytok(zh) if len(x)==2]
        if not(3<=len(toks)<=8): return
        seen.add(zh);sents.append({'tokens':[x[0] for x in toks],'zh':zh,'py':cap(core2.py(zh)),'ar':ar})
        for x in toks: tokpy[x[0]]=x[1]
    for d in dlg:
        if d['who']=='N': continue
        parts=[p for p in re.split(r'(?<=[。？！])',d['zh']) if p]
        if len(parts)==1: add_s(d['zh'],d['ar'])
    for s,bl in gram_secs:
        for b in bl:
            for it in b.get('sl',[]):
                z,a=sp2(it)
                if len(z)>=5 and z[-1] in '。？！': add_s(z,a)
    sents=sents[:14]
    # fills
    fills=[]
    tz=[t['zh'] for t in terms if 1<=len(t['zh'])<=3]
    for s_ in sents:
        c=[w for w in tz if s_['zh'].count(w)==1 and w not in PUN]
        if not c: continue
        a=random.choice(c);i=s_['zh'].index(a)
        dis=[w for w in tz if len(w)==len(a) and w not in s_['zh']]
        if len(dis)<2: dis=[w for w in tz if w!=a and w not in s_['zh']]
        if len(dis)<2: continue
        o=[a]+random.sample(dis,2)
        fills.append({'pre':s_['zh'][:i],'post':s_['zh'][i+len(a):],'ans':a,'opts':o,'ar':s_['ar'],'py':s_['py']})
    fills=fills[:12]
    # authored
    lq=[];says=[]
    for it in L['practice']:
        t=it['t']
        if t=='say': says+=it['items'];continue
        if t=='cloze': lq+=cloze_specs(it);continue
        if t=='cls':
            for z,ci in it['items'][:5]:
                lq.append({'type':'mc','prompt':'<div class="han ltr" style="font-size:26px">%s</div><div class="mut">ما نوع هذه الجملة؟</div>'%esc(z),'opts':[{'html':esc(c),'ok':j==ci} for j,c in enumerate(it['cats'])],'fix':1,'fb':'','wid':[]})
            continue
        sp_=conv_q(it,vocab)
        if sp_: lq.append(sp_)
        if t=='order':
            for x in it['items']: pass
            addtok(''.join(it['items']))
        if t=='match':
            pass
    # chars
    chars=[];seenc=set()
    def addc(c,w,ar):
        if c in seenc or not CJK.match(c): return
        seenc.add(c);chars.append({'c':c,'py':syl_str(c),'ar':ar,'w':w})
    for t in terms:
        if len(t['zh'])==1: addc(t['zh'],t['zh'],t['ar'])
    for t in terms:
        if len(chars)>=8: break
        for c in t['zh']:
            if len(chars)<8: addc(c,t['zh'],t['ar'])
    chars=chars[:8]
    if L.get('chars'): chars=[{'c':c,'py':syl_str(c),'ar':ar,'w':w} for c,w,ar in L['chars']]
    # grammar html
    gtitle,gsub=(('القواعد','ملاحظات الدرس وأنماط الجمل والجمل المفتاحية. اضغط أي كلمة لترى معناها.') if course in ('prac','gram') else ('الأصوات والجمل','استمع وكرّر. اضغط أي كلمة لترى معناها.'))
    g='<div class="sec-h"><h2>%s</h2><p>%s</p></div>'%(gtitle,gsub)
    for s,bl in gram_secs:
        g+='<h3 class="sub-h">%s · <span class="han" dir="ltr">%s</span></h3><div class="card">%s</div>'%(esc(s['ar']),esc(s['h']),render_blocks(bl))
    if says:
        g+='<h3 class="sub-h">كرّر بعدي</h3><div class="card"><p class="mut">استمع لكل جملة ثم كرّرها بصوت عالٍ.</p><div class="qa">'+''.join(rowm(*sp2(x)) for x in says)+'</div></div>'
    acts=['match','listen','meaning','tone']
    if len(sents)>=3: acts.append('order')
    if len(fills)>=3: acts.append('fill')
    if lq: acts.append('lesson')
    acts.append('write')
    data={'vocab':vocab,'tokpy':tokpy,'dlg':dlg,'txt':txt,'sent':sents,'fill':fills,'chars':chars,'spk':spk,'pitch':PIT,'acts':acts,'lq':lq,'gram':g,'disc':L['discuss'],'minc':L.get('minc',12)}
    if L.get('levels'): data['lv']=lv_banks(vocab,fills,L)
    return data,NZ[n],NA[n]
SLOTS=('data','grammar','writing','quiz','events')
def slots_for(L):
    """Extras slots of tpl.html. Generated lessons leave them empty; hand-built lessons 6-8 (L['legacy'])
    carry their lesson-specific code frozen as readable snippets in legacy/<name>.<slot>.js."""
    if not L.get('legacy'): return {k:'' for k in SLOTS}
    return {k:open('legacy/%s.%s.js'%(L['legacy'],k),encoding='utf8').read().rstrip('\n') for k in SLOTS}
def make(name):
    m=importlib.import_module(name);L=m.L
    if L.get('legacy'):   # frozen lesson: no generated data, everything lesson-specific comes from the slots
        data={'lq':[],'disc':[],'minc':12,'gram':''};nz=L['seal'];na=NA[L['n']]
    else:
        data,nz,na=build(L)
    tpl=open('tpl.html',encoding='utf8').read()
    course=L['course']
    fn=({'prac':'prac-%d.html','lis':'lis-%d.html','biz':'biz-%d.html','gram':'lesson-%d.html'}[course])%L['n']
    items=series_items(course);lnav=lnav_html(course,items,[u for u,_ in items].index(fn))
    out=tpl.replace('%%TITLE%%',esc('الدرس %s %s'%(na,L['title_zh']))).replace('%%CRS%%','gram,fl' if course=='gram' else course).replace('%%COURSE%%',course).replace('%%SEAL%%',nz).replace('%%H1%%','الدرس '+na).replace('%%SUB%%',esc(L.get('sub') or L['title_zh'])).replace('%%GTAB%%','القواعد' if course in ('prac','biz','gram') else 'الأصوات').replace('%%KEY%%',L.get('key') or 'noor-%s%d-v1'%(course,L['n'])).replace('%%LNAV%%',lnav)
    for k,v in slots_for(L).items(): out=out.replace('%%X_'+k.upper()+'%%',v)
    out=out.replace('%%DATA%%',json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    open(fn,'w',encoding='utf8').write(out);
    print(fn,len(out),'vocab',len(data.get('vocab',[])),'dlg',len(data.get('dlg',[])),'sent',len(data.get('sent',[])),'fill',len(data.get('fill',[])),'lq',len(data['lq']),'chars',len(data.get('chars',[])))
if __name__=='__main__':
    for a in sys.argv[1:]: make(a)
