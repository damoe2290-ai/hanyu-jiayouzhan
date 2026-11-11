"""One-time extraction: hand-built lessons 6, 7, 8 -> slot snippets for tpl.html.

    python3 mk_legacy.py <dir-with-the-old-lesson-6.html-7-8>       (run in tools/lsn3)

The old pages are in git: commit 501fc2e still has them, e.g.
    mkdir /tmp/old && for n in 6 7 8; do git show 501fc2e:lesson-$n.html > /tmp/old/lesson-$n.html; done

For each lesson it writes legacy/g<N>.{data,grammar,writing,quiz,events}.js. The snippets are the old page's own code,
verbatim (nothing is re-authored); they are inserted into the extras slots of tpl.html by build3.py (L['legacy']).
  data     content + illustrations + dialogue data + exercises data (vocab, drawings, picture quiz, sentences, ...)
  grammar  the interactive grammar section
  writing  the writing section (lesson-specific stroke notes, character panel)
  quiz     lesson-specific quiz kinds: extra builder functions, X.info labels, X.build cases
  events   lesson-specific grammar widget handlers (A.<name>=...)
Re-running this only makes sense if the old pages change; the snippets are the source of truth afterwards."""
import re,sys,os

def script(path):
    s=open(path,encoding='utf8').read();return s[s.rindex('<script>')+8:s.rindex('</script>')]
def sections(js):
    parts=re.split(r'(/\* -{5,}[^*]*?-{5,} \*/)',js);out={};order=[]
    for k in range(1,len(parts),2):
        nm=parts[k].strip('/* -')
        if nm in out: nm+=' (render)'
        out[nm]=parts[k]+parts[k+1];order.append(nm)
    return out
def balanced_end(src,start):
    i=src.index('{',start);d=0;k=i;q=None
    while k<len(src):
        c=src[k]
        if q:
            if c=='\\':k+=2;continue
            if c==q:q=None
        elif c in '\'"`':q=c
        elif c=='{':d+=1
        elif c=='}':
            d-=1
            if d==0:return k+1
        k+=1
    raise ValueError('unbalanced braces')
def handlers(sec):
    out={}
    for m in re.finditer(r'^A\.(\w+)=',sec,re.M):
        e=balanced_end(sec,m.start())
        if sec[e:e+1]==';':e+=1
        out[m.group(1)]=sec[m.start():e]
    return out
def functions(sec):
    out={}
    for m in re.finditer(r'^function (\w+)\(',sec,re.M):
        out[m.group(1)]=sec[m.start():balanced_end(sec,m.start())]
    return out

GENERIC={'tab','slow','theme','say','sayline','tok','closesheet','playall','tpy','tar','tpy2','tar2','flip','next','prev','know','again','jump','cq','wch','wclear','wghost','start','qexit','qnext','opt','pick','unpick','checkorder','fill','ml','mr'}
TEMPLATE_INFO={'match','listen','meaning','tone','order','fill','lesson','write'}
TEMPLATE_CASES={'match','listen','meaning','tone','order','fill','review','lesson'}

def extract(n,old_path,tpl_js):
    js=script(old_path);sec=sections(js)
    tpl_fns=set(functions(tpl_js))
    out={}
    out['data']='\n'.join(sec[k].rstrip() for k in ('content','illustrations (original drawings)','dialogue','exercises'))
    out['grammar']=sec['grammar'].rstrip()
    out['writing']=sec['writing'].rstrip()
    # --- quiz kinds
    P=sec['practice / quiz']
    extra_fns=[t for nm,t in functions(P).items() if nm not in tpl_fns]
    info_m=re.search(r'var info=\{(.*?)\};',P,re.S)
    info=[(k,v) for k,v in re.findall(r"(\w+):(\[[^\]]*\])",info_m.group(1)) if k not in TEMPLATE_INFO]
    bf=functions(P)['build']
    cases=[(k,r) for k,r in re.findall(r"^\s*case '(\w+)':(return [^\n]*;)\s*$",bf,re.M) if k not in TEMPLATE_CASES]
    r_old=set(re.findall(r'^R\.(\w+)=',P,re.M));r_tpl=set(re.findall(r'^R\.(\w+)=',tpl_js,re.M))
    assert r_old<=r_tpl,('lesson %d has question renderers the template lacks: %s'%(n,sorted(r_old-r_tpl)))
    q='/* ---------- lesson-specific quiz kinds (extras: X.info labels, X.build cases) ---------- */\n'
    q+='\n'.join(extra_fns)+('\n' if extra_fns else '')
    q+='X.info={'+','.join('%s:%s'%kv for kv in info)+'};\n'
    q+='X.build=function(kind){\n  switch(kind){\n'+''.join('    case \'%s\':%s\n'%c for c in cases)+'  }\n  return null;\n};'
    out['quiz']=q
    # --- events
    h=handlers(sec['events'])
    extra=[(k,v) for k,v in h.items() if k not in GENERIC]
    out['events']='/* ---------- lesson-specific grammar widget handlers ---------- */\n'+'\n'.join(v for k,v in extra)
    return out,dict(extra_fns=list(functions(P).keys() & set(f for f in functions(P) if f not in tpl_fns)),info=[k for k,_ in info],cases=[c[0] for c in cases],handlers=[k for k,_ in extra])

if __name__=='__main__':
    src=sys.argv[1]
    tpl_js=script('tpl.html')
    os.makedirs('legacy',exist_ok=True)
    for n in (6,7,8):
        out,meta=extract(n,os.path.join(src,'lesson-%d.html'%n),tpl_js)
        for k,v in out.items():
            open('legacy/g%d.%s.js'%(n,k),'w',encoding='utf8').write(v+'\n')
        print('lesson',n,{k:len(v) for k,v in out.items()},meta)
