import sys,json
sys.path.insert(0,'.')
import build3 as B
from build3 import *
import ck,ckt
from buildc import sb,rb,hanpy,tables
KD={'vs':0}
def th(zh,ar): return '<h3 class="th"><span class="han" dir="ltr">%s</span><small>%s</small></h3>'%(esc(zh),esc(ar))
def defcard(d):
    z,pp=hanpy(d['zh'])
    return '<div class="dc"><div class="dh"><span class="han" dir="ltr">%s</span><span class="py" dir="ltr">%s</span><span class="nm">%s</span></div>%s</div>'%(z,pp,esc(d['name']),sb(d['def']))
def tlitem(ar,zh,kind,txt):
    k={'أسطورة':'leg','خلاف':'dis'}.get(kind,'')
    tag='<span class="tag %s">%s</span>'%(k,'传说' if k=='leg' else '年代有争议') if k else ''
    return '<li class="ev k-%s"><div class="dt"><b class="han" dir="ltr">%s</b><small class="arx mut">%s</small>%s</div>%s</li>'%(k,esc(zh),esc(ar),tag,sb(txt))
def pcard(p,head_only=False):
    rz,dz,kz=ckt.PZ[p['zh']]
    z,pp=hanpy(p['zh'])
    h='<div class="pc"><div class="ph"><div class="av" lang="zh">%s</div><div class="pn"><span class="han" dir="ltr">%s</span><span class="py" dir="ltr">%s</span><span class="ar arx">%s</span></div></div>'%(esc(p['zh'][0]),z,pp,esc(p['ar']))
    h+='<div class="chips"><span class="kd">%s</span>%s</div>'%(kz,'<span>%s</span>'%dz if dz else '')
    h+=sb(rz+'｜'+p['role'])+''.join(sb(f) for f in p['facts'])
    return h+'</div>'
def topic_html(n,i,tp,C,L):
    P={p['zh']:p for p in C['people']}
    h='<button class="btn ghost sm tback" data-act="tback">← <span lang="zh">返回主题</span></button>'
    z,pp=hanpy(tp['zh'])
    h+='<div class="thd"><div class="nm"><div class="av" lang="zh">%s</div><div class="pn"><span class="big han" dir="ltr">%s</span><span class="py" dir="ltr">%s</span><span class="ar arx">%s</span></div></div><div class="chips"><span class="kd">%s</span></div></div>'%(esc(tp['seal']),z,pp,esc(tp['ar']),esc(tp['chip']))
    D={d['zh']:d for d in C['defs']}
    if tp.get('self'): h+=pcard(P[tp['self']])
    h+=th('定义','التعريف')
    defs=[D[x] for x in tp['defs']]
    h+=defcard(defs[0]) if not tp.get('self') else ''
    rest=defs[1:] if not tp.get('self') else defs
    tl=[x for x in C['tl'] if x[4]==tp['tl']]
    if tl: h+=th('时间','الزمن')+'<ol class="tlv">'+''.join(tlitem(*x[:4]) for x in tl)+'</ol>'
    pe=[P[x] for x in tp['people']]
    if pe: h+=th('人物','الشخصيات')+''.join(pcard(p) for p in pe)
    if tp.get('peoples'): h+=th('十个穆斯林民族','القوميات المسلمة العشر')+'<div class="tiles" style="margin-top:8px">'+''.join(tile(a,b) for a,b in C['peoples'])+'</div>'
    if rest: h+=th('关键词' if not tp.get('self') and n!=2 and n!=4 else ('习俗与词语' if n==2 else '关键词'),'المفردات والعادات' if n==2 else 'كلمات مفتاحية')+''.join(defcard(d) for d in rest)
    return h
def hub(n,L,C):
    h='<div class="sec-h"><h2 lang="zh">%s</h2><p>%s</p></div>'%(esc(L['title_zh']),esc(L.get('intro_ar','')))
    h+='<div class="facts">'+''.join('<div class="fact"><small>%s</small><b>%s</b></div>'%(esc(a),esc(b)) for a,b in C['facts'])+'</div>'
    for i,tp in enumerate(ckt.T[n]):
        z,pp=hanpy(tp['zh'])
        h+='<button class="tc" data-act="topic" data-i="%d"><span class="sl" lang="zh">%s</span><span><span class="zn han" dir="ltr">%s</span><span class="py" dir="ltr">%s</span><span class="ds"><span class="arx">%s · </span><span lang="zh">%s</span></span></span></button>'%(i,esc(tp['seal']),z,pp,esc(tp['ar']),esc(tp['chip']))
    return h
def cmp_html(n,L,C):
    h='<div class="sec-h"><h2 lang="zh">对比</h2><p class="arx">الفروق والاتفاقات في مكان واحد.</p></div>'
    T=tables(L)
    for c,tz,ta in zip(C['cmp'],ckt.CMPZ[n],ckt.CMPA[n]):
        h+=th(tz,ta);k=c['kind']
        if k=='vs':
            tb=T[c.get('tbl',0)]
            h+='<div class="vs"><div class="h"></div><div class="h">%s</div><div class="h">%s</div>'%(cellhtml(tb['head'][1]),cellhtml(tb['head'][2]))
            for r in tb['rows']:
                lz,la=sp2(r[0]);h+='<div class="l"><span class="han" dir="ltr" style="font-size:15px">%s</span><small class="arx" style="display:block">%s</small></div><div>%s</div><div>%s</div>'%(esc(lz),esc(la),cellhtml(r[1]),cellhtml(r[2]))
            h+='</div>'
            if c.get('same'): h+='<div class="same"><h4><span lang="zh">共同点</span> <small class="arx">أوجه الاتفاق</small></h4>%s</div>'%sb(c['same'])
            if c.get('diff'): h+='<div class="diff"><h4><span lang="zh">不同点</span> <small class="arx">أوجه الاختلاف</small></h4>%s</div>'%sb(c['diff'])
        elif k=='vs2':
            h+='<div class="vs"><div class="h"></div><div class="h">%s</div><div class="h">%s</div>'%(cellhtml(c['a']),cellhtml(c['b']))
            for l,a,b in c['rows']:
                lz,la=sp2(l);h+='<div class="l"><span lang="zh">%s</span></div><div>%s</div><div>%s</div>'%(esc(lz if iscjk(lz) else la),cellhtml(a),cellhtml(b))
            h+='</div>'
        elif k=='table': h+=render_blocks([{'table':T[c['tbl']]}])
        elif k=='map':
            tb=T[c['tbl']]
            h+='<div class="mp" style="font-weight:700"><div>%s</div><span></span><div>%s</div></div>'%(cellhtml(tb['head'][0]),cellhtml(tb['head'][1]))
            for a,b in tb['rows']: h+='<div class="mp"><div>%s</div><span>←</span><div>%s</div></div>'%(cellhtml(a),cellhtml(b))
    return h
def lesson_html(L,C):
    h='<div class="sec-h"><h2 lang="zh">%s</h2><p class="arx">%s</p></div>'%(esc(L['title_zh']),esc(L['title_ar']))
    for s in L['sections']:
        h+='<h3 class="th"><span class="han" dir="ltr">%s</span><small>%s</small></h3><div class="card">%s</div>'%(esc(s['h']),esc(s['ar']),rb(s['b']))
    return h
def make(n):
    L=ck.LS[n];C=ck.CK[n];L['course']='cult'
    used={x for tp in ckt.T[n] for x in tp['defs']}
    miss=[d['zh'] for d in C['defs'] if d['zh'] not in used]
    if miss: print('UNUSED defs',n,miss)
    data,nz,na=B.build(L)
    data['gram']='';data['minc']=L.get('minc',40);data['nt']=len(ckt.T[n])
    data['h']={'hub':hub(n,L,C),'topics':[topic_html(n,i,tp,C,L) for i,tp in enumerate(ckt.T[n])],'compare':cmp_html(n,L,C),'lesson':lesson_html(L,C)}
    data['acts']=[a for a in data['acts'] if a!='tone']
    tpl=open('tplt.html',encoding='utf8').read()
    items=series_items('cult');lnav=lnav_html('cult',items,[u for u,_ in items].index('cult-%d.html'%n))
    sub=L['title_zh']
    out=tpl.replace('%%TITLE%%',esc('第%s课 · %s'%(nz,sub))).replace('%%COURSE%%','cult').replace('%%SEAL%%',L.get('big','文')[:2]).replace('%%H1%%','第%s课'%nz).replace('%%SUB%%',esc(sub)).replace('%%KEY%%','noor-cult%d-v1'%n).replace('%%LNAV%%',lnav).replace('%%DATA%%',json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    open('cult-%d.html'%n,'w',encoding='utf8').write(out)
    print(n,len(out))
if __name__=='__main__':
    for a in sys.argv[1:]: make(int(a))
