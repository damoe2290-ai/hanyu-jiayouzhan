t=open('tpl.html',encoding='utf8').read()
def rep(o,n,cnt=1):
    global t
    assert t.count(o)==cnt,(o[:70],t.count(o)); t=t.replace(o,n)
# nav
i=t.index('<nav class="tabs"');j=t.index('</nav>',i)+6
t=t[:i]+'''<nav class="tabs" role="tablist" aria-label="أقسام الدرس">
      <button class="tab" role="tab" data-act="tab" data-tab="lesson">الدرس</button>
      <button class="tab" role="tab" data-act="tab" data-tab="defs">التعاريف</button>
      <button class="tab" role="tab" data-act="tab" data-tab="timeline">الخط الزمني</button>
      <button class="tab" role="tab" data-act="tab" data-tab="people">%%PTAB%%</button>
      <button class="tab" role="tab" data-act="tab" data-tab="compare">المقارنة</button>
      <button class="tab" role="tab" data-act="tab" data-tab="vocab">المفردات</button>
      <button class="tab" role="tab" data-act="tab" data-tab="practice">التمارين</button>
    </nav>'''+t[j:]
i=t.index('<main>');j=t.index('</main>')
t=t[:i]+'<main>'+''.join('\n    <section id="p-%s" class="panel" hidden></section>'%x for x in ['lesson','defs','timeline','people','compare','vocab','practice'])+'\n  '+t[j:]
rep("TABS=['vocab','dialogue','grammar','writing','practice'];\nvar tab='vocab';","TABS=['lesson','defs','timeline','people','compare','vocab','practice'];\nvar tab='lesson';")
rep("var RENDER={vocab:renderVocab,dialogue:renderDialogue,grammar:renderGrammar,writing:renderWriting,practice:renderPractice};","""function st(n){return function(){$('#p-'+n).innerHTML=D.h[n]}}
var RENDER={lesson:st('lesson'),defs:st('defs'),timeline:st('timeline'),people:st('people'),compare:st('compare'),vocab:renderVocab,practice:renderPractice};""")
rep("if(TABS.indexOf(name)<0)name='vocab';\n  tab=name;","if(TABS.indexOf(name)<0)name='lesson';\n  tab=name;S.seen=S.seen||{};S.seen[name]=1;if(['lesson','defs','timeline','people','compare'].every(function(x){return S.seen[x]}))award('listener');save();")
rep("setTab(location.hash.replace('#','')||'vocab',true);","setTab(location.hash.replace('#','')||'lesson',true);")
rep("var k=knownCount()/VOCAB.length,h=Object.keys(S.heard).length/DLG.length,a=ACTS.filter(function(x){return S.best[x]}).length/ACTS.length;\n  return Math.round((k+h+a)/3*100);","var k=knownCount()/VOCAB.length,h=Object.keys(S.seen||{}).length/5,a=ACTS.filter(function(x){return S.best[x]}).length/ACTS.length;\n  return Math.round((k+Math.min(1,h)+a)/3*100);")
rep("listener:{g:'听',n:'المستمع'}","listener:{g:'读',n:'القارئ المستكشف'}")
css='''
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:12px 0}
.fact{border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:8px 10px;display:flex;flex-direction:column;gap:2px}
.fact small{color:var(--muted);font-size:12px}.fact b{font-size:15px}
.dgrp{margin:18px 0 8px;font-size:15px;color:var(--muted);font-weight:700}
.dc{border:1px solid var(--line);background:var(--surface);border-radius:16px;padding:12px 14px;margin-top:10px}
.dh{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.dh .han{font-size:30px;font-weight:700}.dh .py{color:var(--muted);font-size:14px}.dh .nm{margin-inline-start:auto;font-weight:700;color:var(--accent)}
.tlv{list-style:none;margin:12px 0 0;padding:0 18px 0 0;border-inline-start:3px solid var(--line);position:relative}
.ev{position:relative;margin:0 0 14px;padding-inline-start:14px}
.ev::before{content:"";position:absolute;inset-inline-start:-9px;top:6px;width:13px;height:13px;border-radius:50%;background:var(--accent);border:2px solid var(--bg)}
.ev.k-leg::before{background:var(--bg);border:2px dashed var(--warn,#c77d00)}
.ev.k-dis::before{background:var(--muted)}
.ev .dt{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.ev .dt b{font-size:16px}.ev .dt .han{color:var(--muted);font-size:15px}
.ev.k-leg .sentbox{border-style:dashed}
.tag{font-size:12px;padding:1px 8px;border-radius:99px;border:1px solid var(--line);color:var(--muted)}
.tag.leg{border-color:var(--warn,#c77d00);color:var(--warn,#c77d00)}.tag.dis{border-color:var(--muted)}
.pc{border:1px solid var(--line);background:var(--surface);border-radius:16px;padding:12px 14px;margin-top:12px}
.ph{display:flex;gap:12px;align-items:center}
.av{width:52px;height:52px;border-radius:14px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;font:700 28px var(--font-han);flex:none}
.pn{display:flex;flex-direction:column;gap:2px;min-width:0}.pn .han{font-size:24px;font-weight:700}.pn .py{color:var(--muted);font-size:13px}.pn .ar{font-weight:700}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.chips span{font-size:12.5px;padding:2px 10px;border-radius:99px;border:1px solid var(--line);background:var(--bg)}
.chips span.kd{background:var(--accent-soft);color:var(--accent);border-color:transparent}
.chips .han{font-size:15px}
.vs{display:grid;grid-template-columns:minmax(70px,.7fr) 1fr 1fr;gap:6px;margin-top:10px}
.vs>div{padding:8px;border-radius:10px;background:var(--surface);border:1px solid var(--line);font-size:14px}
.vs .h{background:var(--accent-soft);border-color:transparent;font-weight:700;text-align:center}
.vs .l{font-weight:700;color:var(--muted)}
.vs .han{font-size:17px}
.same,.diff{margin-top:12px;border-radius:14px;padding:10px 12px;border:1px solid}
.same{background:var(--good-soft);border-color:var(--good)}.diff{background:#fff4dc;border-color:#d9a21b}
@media (prefers-color-scheme:dark){.diff{background:#3a2e10}}
:root[data-theme=dark] .diff{background:#3a2e10}
.same h4,.diff h4{margin:0 0 4px;font-size:14px}
.mp{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-top:8px}
.mp>div{padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--surface)}
.mp>span{color:var(--accent);font-size:20px}
.ul{margin:8px 0;padding:0;list-style:none;display:grid;gap:6px}
.tlr{margin-top:8px;display:grid;gap:4px}.tlr b{color:var(--accent)}
#p-compare .tok .zh,#p-timeline .tok .zh,#p-people .tok .zh,#p-defs .tok .zh,#p-lesson .tok .zh{font-size:21px}
#p-compare .tok .py,#p-timeline .tok .py,#p-people .tok .py,#p-defs .tok .py,#p-lesson .tok .py{font-size:11px}
#p-vocab .row{grid-template-columns:44px minmax(0,7.5em) minmax(0,1fr) auto auto}
#p-vocab .rz{font-size:19px;overflow-wrap:anywhere;min-width:0}
@media (max-width:420px){.vs{grid-template-columns:.8fr 1fr 1fr;gap:4px}.vs>div{padding:6px;font-size:13px}}
'''
rep('</style>\n\n<div class="wrap"',css+'</style>\n\n<div class="wrap"')
rep("var sel=$('.tab[aria-selected=\"true\"]');if(sel&&sel.scrollIntoView){try{sel.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}}","var sel=$('.tab[aria-selected=\"true\"]'),nv=$('.tabs');if(sel&&nv){try{nv.scrollLeft+=sel.getBoundingClientRect().left+sel.offsetWidth/2-(nv.getBoundingClientRect().left+nv.clientWidth/2)}catch(e){}}")
rep('  </main>','  </main>\n  <footer class="cfoot"><span dir="ltr">© 2026 Dr. Mahmod Alsideig · <span lang="zh">大漠老师</span> · All rights reserved. Content is for personal learning only and may not be copied or republished without permission.</span></footer>')
rep('</style>\n\n<div class="wrap"','.cfoot{margin:28px 0 12px;padding-top:12px;border-top:1px solid var(--line);text-align:center;color:var(--muted);font-size:12px;line-height:1.6}\n</style>\n\n<div class="wrap"')
open('tplc.html','w',encoding='utf8').write(t)
print(len(t))
