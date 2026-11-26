/* Shared engine of the style prototypes: data, storage, theme, zh-CN speech, XP and four exercise types.
   Each direction styles the generic classes (.q, .q-o, .q-tok ...) in its own way. */
var DATA=/*DATA*/;
var LS=(function(){
'use strict';
var KEY=window.PAGE_KEY||'labs',S={xp:0,done:{},words:{},pos:null,today:0,day:''};
try{var raw=localStorage.getItem(KEY);if(raw){var o=JSON.parse(raw);for(var k in o)S[k]=o[k]}}catch(e){}
var d=new Date().toISOString().slice(0,10);if(S.day!==d){S.day=d;S.today=0}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function $(s,r){return(r||document).querySelector(s)}
function $$(s,r){return[].slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function zh(s){return esc(s).replace(/([㐀-鿿，。？！、：（）…·]+)/g,'<span class="han" lang="zh-CN" dir="ltr">$1</span>')}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* theme */
try{var th=localStorage.getItem('labs-theme');if(th)document.documentElement.dataset.theme=th}catch(e){}
function toggleTheme(){var h=document.documentElement,dark=h.dataset.theme?h.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
  h.dataset.theme=dark?'light':'dark';try{localStorage.setItem('labs-theme',h.dataset.theme)}catch(e){}}
/* toast */
var tt=0;function toast(m){var t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.textContent=m;t.className='show';clearTimeout(tt);tt=setTimeout(function(){t.className=''},2600)}
/* speech */
var voice=null,warned=false;
function pick(){if(!('speechSynthesis' in window))return;var vs=speechSynthesis.getVoices();
  voice=vs.filter(function(v){return/^zh[-_]CN/i.test(v.lang)})[0]||vs.filter(function(v){return/^zh/i.test(v.lang)&&!/HK|TW/i.test(v.lang)})[0]||null}
if('speechSynthesis' in window){pick();speechSynthesis.onvoiceschanged=pick}
function say(t,slow){if(!('speechSynthesis' in window)||!voice){if(!warned){warned=true;toast('لا يوجد صوت صيني على هذا الجهاز. اقرأ البينيين، أو ثبّت الصوت من إعدادات «تحويل النص إلى كلام».')}return false}
  speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang='zh-CN';u.voice=voice;u.rate=slow?.55:.85;speechSynthesis.speak(u);return true}
/* xp */
function xp(n,el){S.xp+=n;S.today+=n;save();document.dispatchEvent(new CustomEvent('xp',{detail:{n:n,total:S.xp}}));
  if(el&&!reduce){var r=el.getBoundingClientRect(),f=document.createElement('span');f.className='xpfly';f.textContent='+'+n;
    f.style.left=Math.min(innerWidth-50,Math.max(8,r.left+r.width/2-16))+'px';f.style.top=(r.top-6)+'px';document.body.appendChild(f);setTimeout(function(){f.remove()},900)}}
function mark(id){if(!S.done[id]){S.done[id]=1;save();document.dispatchEvent(new CustomEvent('done',{detail:id}))}}
/* line pinyin from tokens */
function linePy(l){return l.tok.filter(function(t){return t[1]}).map(function(t){return t[1].replace(/ /g,'')}).join(' ')}
function lineWords(l){var seen={};return l.tok.filter(function(t){return t[1]&&t[2]&&!seen[t[0]]&&(seen[t[0]]=1)})}
function gramOf(zhs){return DATA.gram.filter(function(g){return new RegExp(g.re).test(zhs)})}
/* ---------- exercises: each returns an element; done(ok) is called once ---------- */
var solvers=new WeakMap();
function box(cls,prompt){var el=document.createElement('div');el.className='q '+cls;el.innerHTML='<div class="q-p">'+prompt+'</div>';return el}
function fin(el,ok,done,why){if(el.dataset.done)return;el.dataset.done='1';el.classList.add('done',ok?'is-ok':'is-bad');
  var w=document.createElement('div');w.className='q-why';w.setAttribute('role','status');w.innerHTML='<b>'+(ok?'أحسنت':'ليس تمامًا')+'</b>'+(why?' · '+why:'');el.appendChild(w);done&&done(ok)}
function mcq(q,done){var el=box('q-mcq',zh(q.q)),o=document.createElement('div');o.className='q-opts';
  var opts=q.o.map(function(t,i){return{t:t,ok:i===q.a}}),ord=q.o.length===2?opts:shuffle(opts);
  ord.forEach(function(x){var b=document.createElement('button');b.className='q-o';b.innerHTML=zh(x.t);b.onclick=function(){if(el.dataset.done)return;
    $$('.q-o',o).forEach(function(y,i){y.disabled=true;if(ord[i].ok)y.classList.add('ok')});if(!x.ok)b.classList.add('bad');if(x.ok)xp(10,b);fin(el,x.ok,done,zh(q.why||''))};o.appendChild(b)});
  el.appendChild(o);solvers.set(el,function(){ord.forEach(function(x,i){if(x.ok)$$('.q-o',o)[i].click()})});return el}
function order(it,done){var el=box('q-order','رتّب الجملة: <span class="q-ar">'+esc(it.ar)+'</span>'),ans=document.createElement('div'),pool=document.createElement('div'),tries=0;
  ans.className='q-ans';pool.className='q-pool';var toks=it.tok.map(function(t,i){return{t:t,i:i}}),sh=shuffle(toks);
  if(sh.map(function(x){return x.t}).join('')===it.tok.join('')&&sh.length>1)sh.push(sh.shift());
  function check(){var got=$$('.q-tok',ans).map(function(b){return b.dataset.t}).join('');if($$('.q-tok',pool).length)return;
    if(got===it.tok.join('')){xp(tries?8:15,ans);fin(el,true,done,'<span class="han" lang="zh-CN">'+esc(it.zh)+'</span> <span class="py" dir="ltr">'+esc(it.py)+'</span>')}
    else{tries++;el.classList.add('shake');setTimeout(function(){el.classList.remove('shake');$$('.q-tok',ans).forEach(function(b){pool.appendChild(b)})},500);toast('الترتيب غير صحيح، حاول مرة أخرى')}}
  sh.forEach(function(x){var b=document.createElement('button');b.className='q-tok';b.dataset.t=x.t;b.dataset.i=x.i;b.innerHTML='<span class="han" lang="zh-CN">'+esc(x.t)+'</span>';
    b.onclick=function(){if(el.dataset.done)return;(b.parentNode===pool?ans:pool).appendChild(b);check()};pool.appendChild(b)});
  el.appendChild(ans);el.appendChild(pool);
  solvers.set(el,function(){$$('.q-tok',ans).forEach(function(b){pool.appendChild(b)});it.tok.forEach(function(t,i){var b=$$('.q-tok',pool).filter(function(x){return +x.dataset.i===i})[0]||$$('.q-tok',pool).filter(function(x){return x.dataset.t===t})[0];b&&b.click()})});return el}
function fill(it,done){var el=box('q-fill','أكمل الجملة: <span class="q-ar">'+esc(it.ar)+'</span>'),s=document.createElement('div');s.className='q-sent';s.dir='ltr';
  s.innerHTML='<span class="han" lang="zh-CN">'+esc(it.pre)+'</span><span class="q-blank">　　</span><span class="han" lang="zh-CN">'+esc(it.post)+'</span>';
  var o=document.createElement('div');o.className='q-opts q-row';var ord=shuffle(it.opts);
  ord.forEach(function(t){var b=document.createElement('button');b.className='q-o';b.innerHTML='<span class="han" lang="zh-CN">'+esc(t)+'</span>';b.onclick=function(){if(el.dataset.done)return;
    var ok=t===it.ans;$('.q-blank',s).innerHTML='<span class="han" lang="zh-CN">'+esc(it.ans)+'</span>';$('.q-blank',s).classList.add('in');
    $$('.q-o',o).forEach(function(y){y.disabled=true;if(y.textContent===it.ans)y.classList.add('ok')});if(!ok)b.classList.add('bad');if(ok)xp(10,b);
    fin(el,ok,done,'<span class="py" dir="ltr">'+esc(it.py)+'</span>')};o.appendChild(b)});
  el.appendChild(s);el.appendChild(o);solvers.set(el,function(){$$('.q-o',o).forEach(function(b){if(b.textContent===it.ans)b.click()})});return el}
function match(pairs,done){var el=box('q-match','صِل الكلمة بمعناها'),g=document.createElement('div');g.className='q-mgrid';var L=document.createElement('div'),R=document.createElement('div'),sel=null,left=pairs.length,miss=0;
  L.className='q-col';R.className='q-col';
  shuffle(pairs).forEach(function(p){var b=document.createElement('button');b.className='q-m';b.dataset.k=p[0];b.innerHTML='<span class="han" lang="zh-CN">'+esc(p[0])+'</span>';L.appendChild(b)});
  shuffle(pairs).forEach(function(p){var b=document.createElement('button');b.className='q-m';b.dataset.k=p[0];b.textContent=p[1];R.appendChild(b)});
  function on(b,side){if(b.disabled)return;if(!sel||sel.side===side){if(sel)sel.b.classList.remove('sel');sel={b:b,side:side};b.classList.add('sel');if(side==='L')say(b.dataset.k);return}
    if(sel.b.dataset.k===b.dataset.k){[sel.b,b].forEach(function(x){x.classList.remove('sel');x.classList.add('ok');x.disabled=true});xp(5,b);left--;sel=null;if(!left)fin(el,miss<2,done,'وصلتَ '+pairs.length+' أزواج')}
    else{miss++;var a=sel.b;a.classList.remove('sel');[a,b].forEach(function(x){x.classList.add('bad');setTimeout(function(){x.classList.remove('bad')},450)});sel=null}}
  $$('.q-m',L).forEach(function(b){b.onclick=function(){on(b,'L')}});$$('.q-m',R).forEach(function(b){b.onclick=function(){on(b,'R')}});
  g.appendChild(L);g.appendChild(R);el.appendChild(g);
  solvers.set(el,function(){$$('.q-m',L).forEach(function(b){if(b.disabled)return;b.click();$$('.q-m',R).filter(function(x){return x.dataset.k===b.dataset.k})[0].click()})});return el}
function solve(root){$$('.q',root||document).forEach(function(el){if(!el.dataset.done&&solvers.get(el)&&el.offsetParent!==null)solvers.get(el)()})}
/* the hub's lessons: real file names; progress read from the real site's own lesson keys when present */
function lessonXp(key){if(key===(window.PAGE_LESSON_KEY||''))return S.xp;try{var o=JSON.parse(localStorage.getItem(key)||'null');return o&&o.xp||0}catch(e){return 0}}
return{S:S,save:save,$:$,$$:$$,esc:esc,zh:zh,shuffle:shuffle,say:say,xp:xp,mark:mark,toast:toast,toggleTheme:toggleTheme,linePy:linePy,lineWords:lineWords,gramOf:gramOf,
  mcq:mcq,order:order,fill:fill,match:match,solve:solve,lessonXp:lessonXp,reduce:reduce};
})();
window.__ls={S:LS.S,solve:LS.solve};
