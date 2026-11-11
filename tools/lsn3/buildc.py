import sys,json,importlib
sys.path.insert(0,'.')
import build3 as B
from build3 import *
import ck
def sb(s):
    z,a=sp2(s); return sentbox(z,a)
def rb(blocks):
    out='';chunk=[]
    def fl():
        nonlocal out,chunk
        if chunk: out+=render_blocks(chunk);chunk=[]
    for b in blocks:
        if 'ul' in b:
            fl();out+='<ul class="ul">'+''.join('<li>%s</li>'%sb(x) for x in b['ul'])+'</ul>'
        elif 'tl' in b:
            fl();out+='<div class="tlr">'+''.join('<div><b>%s</b>%s</div>'%(esc(l),sb(x)) for l,x in b['tl'])+'</div>'
        else: chunk.append(b)
    fl();return out
def hanpy(zh):
    z=zh.strip('《》');py=syl_str(z)
    return han_html(z,py) if py and len(py.split(' '))==len(z) else esc(z),py_html(py) if py else ''
def tables(L):
    return [b['table'] for s in L['sections'] for b in s['b'] if 'table' in b]
def p_lesson(L,C):
    h='<div class="sec-h"><h2>%s</h2><p>%s</p></div>'%(esc(L['title_ar']),esc(L.get('intro_ar','')))
    h+='<div class="facts">'+''.join('<div class="fact"><small>%s</small><b>%s</b></div>'%(esc(a),esc(b)) for a,b in C['facts'])+'</div>'
    for s in L['sections']:
        h+='<h3 class="sub-h">%s · <span class="han" dir="ltr">%s</span></h3><div class="card">%s</div>'%(esc(s['ar']),esc(s['h']),rb(s['b']))
    return h
def p_defs(L,C):
    h='<div class="sec-h"><h2>التعاريف</h2><p>كل مصطلح مهم في الدرس مع تعريفه. اضغط أي كلمة لترى معناها، والسماعة لتسمع الجملة.</p></div>'
    g=None
    for d in C['defs']:
        if d['g']!=g: g=d['g'];h+='<div class="dgrp">%s</div>'%esc(g)
        z,pp=hanpy(d['zh'])
        h+='<div class="dc"><div class="dh"><span class="han" dir="ltr">%s</span><span class="py" dir="ltr">%s</span><span class="nm">%s</span></div>%s</div>'%(z,pp,esc(d['name']),sb(d['def']))
    return h
def p_tl(L,C):
    h='<div class="sec-h"><h2>الخط الزمني</h2><p>الأحداث مرتبة حسب الموضوع، وداخل كل موضوع من الأقدم إلى الأحدث. النقطة المتقطعة تعني رواية أسطورية لا تاريخاً مؤكداً.</p></div>'
    g=None
    for ar,zh,kind,txt,grp in C['tl']:
        if grp!=g:
            if g is not None: h+='</ol>'
            g=grp;h+='<h3 class="sub-h">%s</h3><ol class="tlv">'%esc(g)
        k={'أسطورة':'leg','خلاف':'dis'}.get(kind,'')
        tag='<span class="tag %s">%s</span>'%(k,esc('أسطورة' if k=='leg' else 'تاريخ غير مؤكد')) if k else ''
        h+='<li class="ev k-%s"><div class="dt"><b>%s</b><span class="han" dir="ltr">%s</span>%s</div>%s</li>'%(k,esc(ar),esc(zh),tag,sb(txt))
    return h+'</ol>'
def p_people(L,C):
    h='<div class="sec-h"><h2>%s</h2><p>من هم، ومتى عاشوا، وماذا ارتبط بهم في الدرس.</p></div>'%esc(C['ptab'])
    if 'peoples' in C:
        h+='<div class="card"><b>القوميات المسلمة العشر</b><div class="tiles" style="margin-top:8px">'+''.join(tile(a,b) for a,b in C['peoples'])+'</div></div>'
    for p in C['people']:
        z,pp=hanpy(p['zh'])
        kd=p['kind']
        h+='<div class="pc"><div class="ph"><div class="av" lang="zh">%s</div><div class="pn"><span class="han" dir="ltr">%s</span><span class="py" dir="ltr">%s</span><span class="ar">%s</span></div></div>'%(esc(p['zh'][0]),z,pp,esc(p['ar']))
        h+='<div class="chips"><span class="kd">%s</span>%s</div>'%(esc(kd),'<span>%s</span>'%esc(p['dates']) if p['dates'] else '')
        h+='<p style="margin:4px 0">%s</p>'%esc(p['role'])+''.join(sb(f) for f in p['facts'])
        if p['tags']: h+='<div class="chips">'+''.join('<span class="han" dir="ltr">%s</span>'%esc(t) for t in p['tags'])+'</div>'
        h+='</div>'
    return h
def p_cmp(L,C):
    h='<div class="sec-h"><h2>المقارنة</h2><p>الفروق والاتفاقات في مكان واحد.</p></div>'
    T=tables(L)
    for c in C['cmp']:
        h+='<h3 class="sub-h">%s</h3>'%esc(c['title'])
        k=c['kind']
        if k=='vs':
            tb=T[c.get('tbl',0)]
            h+='<div class="vs"><div class="h"></div><div class="h">%s</div><div class="h">%s</div>'%(cellhtml(tb['head'][1]),cellhtml(tb['head'][2]))
            for r in tb['rows']: h+='<div class="l">%s</div><div>%s</div><div>%s</div>'%(esc(sp2(r[0])[1] or sp2(r[0])[0]),cellhtml(r[1]),cellhtml(r[2]))
            h+='</div>'
            if c.get('same'): h+='<div class="same"><h4>أوجه الاتفاق</h4>%s</div>'%sb(c['same'])
            if c.get('diff'): h+='<div class="diff"><h4>أوجه الاختلاف</h4>%s</div>'%sb(c['diff'])
        elif k=='vs2':
            h+='<div class="vs"><div class="h"></div><div class="h">%s</div><div class="h">%s</div>'%(cellhtml(c['a']),cellhtml(c['b']))
            for l,a,b in c['rows']: h+='<div class="l">%s</div><div>%s</div><div>%s</div>'%(esc(sp2(l)[1]),cellhtml(a),cellhtml(b))
            h+='</div>'
        elif k=='table':
            h+=render_blocks([{'table':T[c['tbl']]}])
        elif k=='map':
            tb=T[c['tbl']]
            h+='<div class="mp" style="font-weight:700"><div>%s</div><span></span><div>%s</div></div>'%(cellhtml(tb['head'][0]),cellhtml(tb['head'][1]))
            for a,b in tb['rows']: h+='<div class="mp"><div>%s</div><span>←</span><div>%s</div></div>'%(cellhtml(a),cellhtml(b))
    return h
def make(n):
    L=ck.LS[n];C=ck.CK[n];L['course']='cult'
    data,nz,na=B.build(L)
    # relaxed order/fill + 'write' threshold
    data['gram']='';data['minc']=L.get('minc',40)
    data['h']={'lesson':p_lesson(L,C),'defs':p_defs(L,C),'timeline':p_tl(L,C),'people':p_people(L,C),'compare':p_cmp(L,C)}
    data['acts']=[a for a in data['acts'] if a!='tone']
    tpl=open('tplc.html',encoding='utf8').read()
    items=series_items('cult');lnav=lnav_html('cult',items,[u for u,_ in items].index('cult-%d.html'%n))
    out=tpl.replace('%%TITLE%%',esc('الدرس %s · %s'%(na,L['title_ar'].split('·')[-1].strip()))).replace('%%COURSE%%','cult').replace('%%SEAL%%',L.get('big','文')[:2]).replace('%%H1%%','الدرس '+na).replace('%%SUB%%',esc(L['title_ar'].split('·')[-1].strip())).replace('%%PTAB%%',C['ptab']).replace('%%KEY%%','noor-cult%d-v1'%n).replace('%%LNAV%%',lnav).replace('%%DATA%%',json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
    open('cult-%d.html'%n,'w',encoding='utf8').write(out)
    print(n,len(out),{k:len(v) for k,v in data['h'].items()},'vocab',len(data['vocab']),'sent',len(data['sent']),'fill',len(data['fill']),'lq',len(data['lq']),'acts',data['acts'])
if __name__=='__main__':
    for a in sys.argv[1:]: make(int(a))
