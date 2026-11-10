# builds template tpl.html from the grammar lesson 6 (structure + CSS + engine), with data-driven content
h=open('g6.html',encoding='utf8').read()
a=h.index('<meta name="claude:viewport-fit-sides"');b=h.index('</body>')
t=h[a:b]
def rep(o,n,cnt=1):
    global t
    assert t.count(o)==cnt,(o[:70],t.count(o)); t=t.replace(o,n)
def cut(s,e,new):
    global t
    i=t.index(s);j=t.index(e);assert i<j,(s,e); t=t[:i]+new+t[j:]
rep('<meta name="claude:viewport-fit-sides" content="cover">\n','')
rep('<title>الدرس السادس 香蕉多少钱一斤</title>','<title>%%TITLE%%</title>')
rep('<div class="seal" aria-hidden="true" lang="zh">六</div>','<a class="seal" href="index.html#%%COURSE%%" aria-label="العودة إلى الدروس" lang="zh" style="text-decoration:none">%%SEAL%%</a>')
rep('<h1>الدرس السادس</h1><p>第六课 · 香蕉多少钱一斤</p>','<h1>%%H1%%</h1><p>%%SUB%%</p>')
rep('data-tab="grammar">القواعد</button>','data-tab="grammar">%%GTAB%%</button>')
rep("var KEY='noor-lesson6-v1';","var KEY='%%KEY%%',HUBK='zh-hub-v1',CRS='%%COURSE%%';")
# content region
BAD=t[t.index('var BADGES={'):t.index('var ACTS=')]
cut('/* ---------- content ---------- */','/* ---------- progress / badges ---------- */','''/* ---------- content ---------- */
var D=%%DATA%%;
var VOCAB=D.vocab,TOKPY=D.tokpy,DLG=D.dlg,TXT=D.txt,CQ={},SENT=D.sent,FILL=D.fill,CHARS=D.chars,SPK=D.spk,PITCH=D.pitch,ACTS=D.acts;
function pitchOf(w){return PITCH[w]||1}
function vid(zh){for(var i=0;i<VOCAB.length;i++){if(VOCAB[i].zh===zh)return i}return -1}
function picHtml(){return ''}
var CLASSX=[];
'''+BAD)
# grammar region
cut('/* ---------- grammar ---------- */','/* ---------- writing ---------- */','''/* ---------- grammar ---------- */
function renderGrammar(){$('#p-grammar').innerHTML=D.gram}
''')
# writing extra
cut('function writingExtra(){','/* ---------- practice / quiz ---------- */','''function writingExtra(){
  var r=[['من الأعلى إلى الأسفل','上到下','مثل 三 و 二: الخط الأعلى أولاً.'],['من اليسار إلى اليمين','左到右','مثل 你 و 好: الجزء الأيسر أولاً.'],['الأفقي قبل العمودي','先横后竖','مثل 十 و 干: الخط الأفقي أولاً.'],['الوسط قبل الجانبين','先中间后两边','مثل 小 و 水: الخط الأوسط أولاً.'],['من الخارج إلى الداخل ثم الإغلاق','先外后内再封口','مثل 日 و 国: الإطار أولاً ثم الداخل ثم الإغلاق.']];
  return '<div class="card" style="margin-top:18px"><h3 style="font-size:16px;margin-bottom:6px">قواعد ترتيب الخطوط</h3><div class="qa" style="margin-top:0">'+r.map(function(x){return '<div class="m"><div class="t"><span class="z" dir="ltr">'+x[1]+'</span><span>'+x[0]+'</span><span class="mut">'+x[2]+'</span></div></div>'}).join('')+'</div></div>';
}

''')
rep("""<div class="mut">عدد الخطوط: '+c.n+'</div>""","""<div class="mut">من كلمة: <span class="han" dir="ltr">'+esc(c.w)+'</span></div>""")
rep("'<h3 class=\"sub-h\">عبارات الصف</h3><div class=\"qa\" style=\"margin-top:0\">'+cx+'</div>';","(cx?'<h3 class=\"sub-h\">عبارات الصف</h3><div class=\"qa\" style=\"margin-top:0\">'+cx+'</div>':'');")
# practice hub
i=t.index("var info={");j=t.index("};",i)+2
t=t[:i]+"var info={match:['مطابقة','اربط الكلمة بمعناها'],listen:['استماع','اسمع واختر المعنى'],meaning:['المعنى','اقرأ الكلمة واختر معناها'],tone:['النغمات','اختر النطق الصحيح'],order:['ترتيب الجمل','رتّب كلمات الجملة'],fill:['ملء الفراغ','أكمل الجملة بالكلمة الصحيحة'],lesson:['أسئلة الدرس','أسئلة متنوعة على نص الدرس'],write:['تحدّث واكتب','اكتب جملاً بالصينية بمساعدة نماذج']};"+t[j:]
rep("<small>13 سؤالاً من كل الأنواع'+(S.best.all?'':'')+'</small>","<small>'+build('all').length+' سؤالاً من كل الأنواع</small>")
# build()
cut('function build(kind){','function startQuiz(kind){','''function cloneQ(q){return JSON.parse(JSON.stringify(q))}
function fromSpec(sp){var q=cloneQ(sp);if(q.type==='mc'&&q.sp){q.audio=q.sp;q.prompt=q.prompt.replace('@@SPK@@',spkBtn(q.sp,'big'))}if(q.type==='mc'&&!q.fix)q.opts=shuffle(q.opts);return q}
window.__q=function(){return Q};
function build(kind){
  var LQ=D.lq||[];
  switch(kind){
    case 'match':return [qMatch(5),qMatch(5),qMatch(5)];
    case 'listen':return pick(VOCAB,Math.min(5,VOCAB.length)).map(qListen);
    case 'meaning':return pick(VOCAB,Math.min(5,VOCAB.length)).map(qMeaning);
    case 'tone':return pick(VOCAB,Math.min(5,VOCAB.length)).map(qTone);
    case 'order':return pick(SENT,Math.min(4,SENT.length)).map(qOrder);
    case 'fill':return pick(FILL,Math.min(5,FILL.length)).map(qFill);
    case 'lesson':return LQ.map(fromSpec);
    case 'all':return [qMatch(5)].concat(pick(VOCAB,2).map(qListen),pick(VOCAB,2).map(qMeaning),pick(VOCAB,2).map(qTone),SENT.length?pick(SENT,Math.min(2,SENT.length)).map(qOrder):[],FILL.length?pick(FILL,Math.min(2,FILL.length)).map(qFill):[],pick(LQ,Math.min(3,LQ.length)).map(fromSpec));
    case 'review':return pick(Object.keys(S.wrong).map(function(i){return VOCAB[+i]}).filter(Boolean),8).map(function(w,i){return i%2?qListen(w):qMeaning(w)});
  }
  return [];
}
/* ---------- write & speak ---------- */
function ccount(v){return v.replace(/\\s/g,'').length}
function renderWrite(){
  S.txt=S.txt||{};
  $('#p-practice').innerHTML='<div class="qtop"><button class="btn ghost sm" data-act="qexit">رجوع</button><strong>تحدّث واكتب</strong></div>'+
  D.disc.map(function(d,i){var ms=d.model.split('｜');
    return '<section class="card wr" data-wd="'+i+'" style="margin-bottom:12px"><div class="qprompt" style="justify-items:start;text-align:start"><div class="han ltr" style="font-size:22px">'+(i+1)+'. '+esc(d.q)+'</div><div class="mut">'+esc(d.ar)+'</div></div>'+
    '<div class="chips">'+d.frames.map(function(f,k){return '<button class="chip" data-act="wfr" data-d="'+i+'" data-k="'+k+'"><span class="han" style="font-size:17px">'+esc(f)+'</span></button>'}).join('')+'</div>'+
    '<textarea data-wta="'+i+'" lang="zh" placeholder="اكتب إجابتك بالصينية…" aria-label="إجابتك"></textarea>'+
    '<div class="mut" style="margin:6px 0"><span data-wcc="'+i+'">0</span> / '+D.minc+' حرفاً · الكلمات المقترحة:</div><div class="us">'+d.use.map(function(u){return '<span data-wu="'+esc(u)+'">'+esc(u)+'</span>'}).join('')+'</div>'+
    '<details class="md"><summary>نموذج إجابة</summary><div class="han ltr" style="font-size:20px;margin-top:8px">'+esc(ms[0])+'</div><div class="mut">'+esc(ms[1]||'')+'</div><button class="btn ghost sm" data-act="wsay" data-d="'+i+'" style="margin-top:8px">'+ic('spk',16)+' استمع</button></details></section>'}).join('');
  D.disc.forEach(function(d,i){var ta=$('[data-wta="'+i+'"]');ta.value=S.txt[i]||'';wchk(i)});
}
function wchk(i){var ta=$('[data-wta="'+i+'"]'),el=$('[data-wd="'+i+'"]');if(!ta)return;var v=ta.value,n=ccount(v);$('[data-wcc="'+i+'"]').textContent=n;
  $$('[data-wu]',el).forEach(function(s){s.classList.toggle('on',v.indexOf(s.dataset.wu)>-1)});
  S.wdone=S.wdone||{};
  if(n>=D.minc&&!S.wdone[i]){S.wdone[i]=1;S.xp+=20;toast('أحسنت! +20 نقطة')}
  var dn=Object.keys(S.wdone).length;S.best.write=dn>=D.disc.length?3:(dn?2:0);save();updateProg()}
''')
rep("function startQuiz(kind){\n","function startQuiz(kind){\n  if(kind==='write'){renderWrite();return}\n")
# match: local indices
rep("<button class=\"mi\" data-act=\"ml\" data-i=\"'+VOCAB.indexOf(w)+'\">","<button class=\"mi\" data-act=\"ml\" data-i=\"'+q.words.indexOf(w)+'\">")
rep("<button class=\"mi\" data-act=\"mr\" data-i=\"'+VOCAB.indexOf(w)+'\">","<button class=\"mi\" data-act=\"mr\" data-i=\"'+q.words.indexOf(w)+'\">")
rep("speak(VOCAB[+i].zh);","speak(q.words[+i].zh);")
rep("errIds.forEach(function(k){S.wrong[k]=(S.wrong[k]||0)+1});","errIds.forEach(function(k){var vi=VOCAB.indexOf(q.words[k]);if(vi>=0)S.wrong[vi]=(S.wrong[vi]||0)+1});")
# hub review
rep("A.know=function(){","function hubRev(zh,on){try{var h=JSON.parse(localStorage.getItem(HUBK)||'{}')||{};h.dues=h.dues||{};h.dues[CRS]=h.dues[CRS]||{};if(on){if(!h.dues[CRS][zh])h.dues[CRS][zh]={i:0,t:Date.now()}}localStorage.setItem(HUBK,JSON.stringify(h))}catch(e){}}\nA.know=function(){")
rep("A.again=function(){delete S.known[S.card];","A.again=function(){hubRev(VOCAB[S.card].zh,true);toast('أُضيفت إلى مراجعة المفردات في الصفحة الرئيسية');delete S.known[S.card];")
rep("A.wch=function","A.gtok=function(t){openSheet([t.dataset.z,t.dataset.p,t.dataset.a||''])};\nA.wfr=function(t){var i=+t.dataset.d,ta=$('[data-wta=\"'+i+'\"]'),f=D.disc[i].frames[+t.dataset.k],p=ta.selectionStart==null?ta.value.length:ta.selectionStart;ta.value=ta.value.slice(0,p)+f+ta.value.slice(p);S.txt[i]=ta.value;ta.focus();wchk(i)};\nA.wsay=function(t){speak(D.disc[+t.dataset.d].model.split('｜')[0])};\nA.wch=function")
rep("app.addEventListener('keydown'","app.addEventListener('input',function(e){var ta=e.target;if(ta.dataset&&ta.dataset.wta!=null){var i=+ta.dataset.wta;S.txt[i]=ta.value;wchk(i)}});\napp.addEventListener('keydown'")
# css
rep('</style>','''
table{border-collapse:collapse;width:100%;min-width:420px;background:var(--surface)}
.tw{overflow-x:auto;border:1px solid var(--line);border-radius:12px;margin-top:10px}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);border-inline-start:1px solid var(--line);text-align:start;vertical-align:top}
th{background:var(--accent-soft)}td:first-child{background:var(--surface2);font-weight:600}tr:last-child td{border-bottom:0}
.sh2{font-size:15px;font-weight:700;margin:18px 0 6px}
.tiles .tile .han{font-size:24px}
.pair{display:grid;gap:6px;margin-top:8px}.pair .tiles{grid-template-columns:1fr 1fr}
textarea{width:100%;min-height:96px;margin-top:10px;padding:10px 12px;border:1.5px solid var(--line);border-radius:12px;background:var(--surface);color:var(--fg);font:500 20px/1.6 var(--font-han);resize:vertical}
.us{display:flex;gap:6px;flex-wrap:wrap}.us span{padding:2px 10px;border-radius:99px;border:1px solid var(--line);font:500 16px var(--font-han);color:var(--muted)}.us span.on{background:var(--good-soft);border-color:var(--good);color:var(--good)}
details.md{margin-top:10px}details.md summary{cursor:pointer;font-weight:600}
</style>''')
open('tpl.html','w',encoding='utf8').write(t)
print(len(t))
