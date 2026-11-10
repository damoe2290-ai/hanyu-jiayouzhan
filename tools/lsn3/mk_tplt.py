t=open('tplc.html',encoding='utf8').read()
def rep(o,n,cnt=1):
    global t
    assert t.count(o)==cnt,(o[:70],t.count(o)); t=t.replace(o,n)
i=t.index('<nav class="tabs"');j=t.index('</nav>',i)+6
tabs=[('topics','主题','المواضيع'),('compare','对比','المقارنة'),('lesson','课文','النص'),('vocab','词汇','المفردات'),('practice','练习','التمارين')]
t=t[:i]+'<nav class="tabs" role="tablist" aria-label="أقسام الدرس">\n'+'\n'.join('      <button class="tab" role="tab" data-act="tab" data-tab="%s"><span lang="zh">%s</span> <small class="arx">%s</small></button>'%x for x in tabs)+'\n    </nav>'+t[j:]
i=t.index('<main>');j=t.index('</main>')
t=t[:i]+'<main>'+''.join('\n    <section id="p-%s" class="panel" hidden></section>'%x[0] for x in tabs)+'\n  '+t[j:]
rep("TABS=['lesson','defs','timeline','people','compare','vocab','practice'];\nvar tab='lesson';","TABS=['topics','compare','lesson','vocab','practice'];\nvar tab='topics',TOP=-1;")
rep("var RENDER={lesson:st('lesson'),defs:st('defs'),timeline:st('timeline'),people:st('people'),compare:st('compare'),vocab:renderVocab,practice:renderPractice};","""function renderTopics(){$('#p-topics').innerHTML=TOP<0?D.h.hub:D.h.topics[TOP]}
var RENDER={topics:renderTopics,compare:st('compare'),lesson:st('lesson'),vocab:renderVocab,practice:renderPractice};""")
rep("if(TABS.indexOf(name)<0)name='lesson';\n  tab=name;S.seen=S.seen||{};S.seen[name]=1;if(['lesson','defs','timeline','people','compare'].every(function(x){return S.seen[x]}))award('listener');save();","if(TABS.indexOf(name)<0)name='topics';\n  tab=name;")
rep("setTab(location.hash.replace('#','')||'lesson',true);","setTab(location.hash.replace('#','')||'topics',true);")
rep("Object.keys(S.seen||{}).length/5","Object.keys(S.seenT||{}).length/(D.nt||1)")
rep("A.tpy=function(){","""A.topic=function(t){TOP=+t.dataset.i;S.seenT=S.seenT||{};S.seenT[TOP]=1;if(Object.keys(S.seenT).length>=D.nt)award('listener');save();updateProg();renderTopics();window.scrollTo(0,0)};
A.tback=function(){TOP=-1;renderTopics();window.scrollTo(0,0)};
A.arall=function(t){S.arx=!S.arx;save();applyAr()};
function applyAr(){$('#app').classList.toggle('noar',!!S.arx);var b=$('#arbtn');if(b)b.setAttribute('aria-pressed',String(!S.arx))}
A.tpy=function(){""")
rep('<button class="pill" id="slowbtn"','<button class="pill" id="arbtn" data-act="arall" aria-pressed="true">عربي</button>\n      <button class="pill" id="slowbtn"')
rep("setTab(location.hash.replace('#','')||'topics',true);","applyAr();setTab(location.hash.replace('#','')||'topics',true);")
css='''
.tab small{font-size:11px;font-weight:500;opacity:.75}
.sentbox>div:not(.zhline):not(.tools){font-size:13.5px;color:var(--muted);line-height:1.6}
.noar .arx,.noar .sentbox>div:not(.zhline):not(.tools),.noar .tab small,.noar .dh .nm,.noar .fact small{display:none}
.tc{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;width:100%;text-align:start;appearance:none;font:inherit;color:inherit;border:1px solid var(--line);background:var(--surface);border-radius:18px;padding:14px;margin-top:12px;cursor:pointer}
.tc .sl{width:58px;height:58px;border-radius:16px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;font:700 32px var(--font-han)}
.tc .zn{font:700 26px var(--font-han)}.tc .py{color:var(--muted);font-size:13px;display:block}.tc .ds{font-size:13px;color:var(--muted);margin-top:4px;display:block}
.tc:active{transform:scale(.99)}
.th{margin:22px 0 4px;display:flex;align-items:baseline;gap:8px;font-size:20px;border-bottom:2px solid var(--line);padding-bottom:4px}
.th small{font-size:12.5px;color:var(--muted);font-weight:500}
.tback{margin-bottom:10px}
.thd{border:1px solid var(--line);background:var(--surface);border-radius:18px;padding:14px;display:grid;gap:8px}
.thd .nm{display:flex;gap:12px;align-items:center}.thd .big{font:700 30px var(--font-han)}
'''
rep('.cfoot{',css+'.cfoot{')
open('tplt.html','w',encoding='utf8').write(t);print(len(t))
