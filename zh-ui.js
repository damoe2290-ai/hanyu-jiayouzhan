/* zh-ui.js — shared behaviour for 汉语加油站 (hub + all lessons). Loaded with `defer`.
   Everything here is an enhancement: every page works without this file (and without zh-ui.css).
   1. Tone display setting (colours / colour-blind palette / marks only / numbers), saved in localStorage 'zh-ui-v1'.
   2. Settings sheet opened from a gear button in the header (proxies the page's own theme / slow-voice buttons,
      so each page keeps its own saved state and its own localStorage keys).
   3. Marks Chinese text with lang="zh-CN" and isolates it from surrounding Arabic with <bdi> (also for content
      that the page renders later). */
(function(){
'use strict';
var root=document.documentElement,KEY='zh-ui-v1';
var TONES=['color','cb','marks','numbers'];
function load(){try{var o=JSON.parse(localStorage.getItem(KEY));return o&&typeof o==='object'?o:{}}catch(e){return {}}}
function save(o){try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}
var cfg=load();
if(TONES.indexOf(cfg.tone)<0)cfg.tone='color';

/* ---------- tone setting ---------- */
function applyTone(){
  if(cfg.tone==='color')root.removeAttribute('data-tone');else root.setAttribute('data-tone',cfg.tone);
  convertAll();
}
var TM={'ā':'a1','á':'a2','ǎ':'a3','à':'a4','ē':'e1','é':'e2','ě':'e3','è':'e4','ī':'i1','í':'i2','ǐ':'i3','ì':'i4',
  'ō':'o1','ó':'o2','ǒ':'o3','ò':'o4','ū':'u1','ú':'u2','ǔ':'u3','ù':'u4','ǖ':'ü1','ǘ':'ü2','ǚ':'ü3','ǜ':'ü4',
  'ń':'n2','ň':'n3','ǹ':'n4','ḿ':'m2','Ā':'A1','Á':'A2','Ǎ':'A3','À':'A4','Ē':'E1','É':'E2','Ě':'E3','È':'E4',
  'Ī':'I1','Í':'I2','Ǐ':'I3','Ì':'I4','Ō':'O1','Ó':'O2','Ǒ':'O3','Ò':'O4','Ū':'U1','Ú':'U2','Ǔ':'U3','Ù':'U4'};
var MARKED=/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹḿĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙ]/;
var REST=/^[aeiouüAEIOUÜ]*(?:ng(?![aeiouü])|n(?![aeiouü])|r(?![aeiouü]))?/i;
/* měitiān -> mei3tian1 ; neutral tone (no mark) stays unmarked */
function toNumbers(s){
  s=s.normalize?s.normalize('NFC'):s;
  var out='',i=0,c,m,r;
  while(i<s.length){
    c=s.charAt(i);m=TM[c];
    if(!m){out+=c;i++;continue}
    r=REST.exec(s.slice(i+1))[0];
    out+=m.charAt(0)+r+m.charAt(1);i+=1+r.length;
  }
  return out;
}
var origText=(typeof WeakMap==='function')?new WeakMap():null;
function convertText(t){
  if(!origText)return;
  if(cfg.tone==='numbers'){
    if(!origText.has(t)&&MARKED.test(t.data)){origText.set(t,t.data);t.data=toNumbers(t.data)}
  }else if(origText.has(t)){t.data=origText.get(t);origText.delete(t)}
}
function convertAll(){
  if(!document.body)return;
  var tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null),n,list=[];
  while((n=tw.nextNode()))list.push(n);
  if(obs)obs.disconnect();
  list.forEach(function(t){if(!skip(t))convertText(t)});
  watch();
}

/* ---------- Chinese text: lang + bdi ---------- */
var HAN=/[㐀-鿿豈-﫿]/;
var RUN=/[㐀-鿿豈-﫿　-〿＀-￯]+/g;
var SKIPTAG={SCRIPT:1,STYLE:1,TEXTAREA:1,TITLE:1,NOSCRIPT:1,INPUT:1,OPTION:1};
function skip(t){var p=t.parentNode;return !p||p.nodeType!==1||SKIPTAG[p.nodeName]===1}
function inZh(el){var a=el.closest?el.closest('[lang]'):null;return !!(a&&/^zh/i.test(a.getAttribute('lang')))}
var CJKONLY=/^[\s0-9㐀-鿿豈-﫿　-〿＀-￯]*$/;
function tagText(t){
  var p=t.parentNode,s=t.data;
  if(!HAN.test(s)||inZh(p))return;
  if(p.nodeName==='BDI')return;
  /* Only Chinese in this element: just label the element, the DOM structure stays exactly as the page made it. */
  if(p.childNodes.length===1&&CJKONLY.test(s)){if(!p.hasAttribute('lang'))p.setAttribute('lang','zh-CN');return}
  /* Mixed Arabic + Chinese text: never wrap inside a flex/grid container, it would split one flex/grid item in two. */
  if(/flex|grid/.test(getComputedStyle(p).display))return;
  var frag=document.createDocumentFragment(),last=0,m;
  RUN.lastIndex=0;
  while((m=RUN.exec(s))){
    if(!HAN.test(m[0]))continue;           /* punctuation-only run: leave it alone */
    if(m.index>last)frag.appendChild(document.createTextNode(s.slice(last,m.index)));
    var b=document.createElement('bdi');b.setAttribute('lang','zh-CN');b.textContent=m[0];frag.appendChild(b);
    last=m.index+m[0].length;
  }
  if(!frag.firstChild)return;
  if(last<s.length)frag.appendChild(document.createTextNode(s.slice(last)));
  p.replaceChild(frag,t);
}
function processNode(n){
  if(n.nodeType===3){if(!skip(n)){convertText(n);tagText(n)}return}
  if(n.nodeType!==1)return;
  if(SKIPTAG[n.nodeName]===1)return;
  var tw=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,null),x,list=[];
  while((x=tw.nextNode()))list.push(x);
  list.forEach(function(t){if(!skip(t)){convertText(t);tagText(t)}});
}

/* ---------- observer: pages render most content with JS, so tag it as it appears ---------- */
var pending=[],raf=0,obs=null,OPTS={childList:true,subtree:true,characterData:true};
function flush(){
  raf=0;var list=pending;pending=[];
  if(obs)obs.disconnect();
  list.forEach(function(n){if(n.isConnected!==false)processNode(n)});
  watch();
}
function watch(){if(obs&&document.body)obs.observe(document.body,OPTS)}
if(typeof MutationObserver==='function'){
  obs=new MutationObserver(function(recs){
    recs.forEach(function(r){
      if(r.type==='characterData'){pending.push(r.target)}
      else for(var i=0;i<r.addedNodes.length;i++)pending.push(r.addedNodes[i]);
    });
    if(pending.length&&!raf)raf=requestAnimationFrame(flush);
  });
}

/* ---------- settings sheet ---------- */
var ICON={
  sliders:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
  close:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
};
var TONE_LABELS=[
  ['color','ألوان النغمات','الافتراضي'],
  ['cb','ألوان مناسبة','لعمى الألوان'],
  ['marks','العلامات فقط','بدون ألوان'],
  ['numbers','الأرقام','ma3']
];
var sheet=null,opener=null,lastFocus=null;
var SND_ON='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9.5v5M20 7.5v9"/></svg>',SND_OFF='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/></svg>';
function q(s,r){return (r||document).querySelector(s)}
function themeBtn(){return q('.hdr [data-act="theme"]')||q('#th')}
function slowBtn(){return q('#slowbtn')}
function isDark(){var d=root.getAttribute('data-theme');return d?d==='dark':!!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)}
function buildSheet(){
  var h='<div class="zh-sheet" role="document"><h2><span id="zh-set-t">الإعدادات</span><button type="button" class="zh-ib" data-zh="close" aria-label="إغلاق">'+ICON.close+'</button></h2>';
  h+='<h3>المظهر</h3><button type="button" class="zh-row" data-zh="theme" aria-pressed="false"><span>الوضع الليلي</span><span data-zh="themestate"></span></button>';
  if(slowBtn())h+='<h3>الصوت</h3><button type="button" class="zh-row" data-zh="slow" aria-pressed="false"><span>صوت بطيء</span><span data-zh="slowstate"></span></button>';
  if(q('#p-vocab'))h+='<h3>بطاقات المفردات</h3><button type="button" class="zh-row" data-zh="swish" aria-pressed="false"><span>صوت تقليب البطاقة</span><span data-zh="swishstate"></span></button>';
  h+='<h3>عرض النغمات</h3><div class="zh-seg" role="group" aria-label="عرض النغمات">';
  TONE_LABELS.forEach(function(t){h+='<button type="button" data-zh-tone="'+t[0]+'" aria-pressed="false">'+t[1]+'<small>'+t[2]+'</small></button>'});
  h+='</div><div class="zh-sample" lang="en" aria-hidden="true"><span class="t1">mā</span><span class="t2">má</span><span class="t3">mǎ</span><span class="t4">mà</span><span class="t5">ma</span></div></div>';
  sheet=document.createElement('div');sheet.className='zh-set';sheet.hidden=true;sheet.setAttribute('role','dialog');
  sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','zh-set-t');sheet.innerHTML=h;
  document.body.appendChild(sheet);
  sheet.addEventListener('click',function(e){
    if(e.target===sheet){closeSheet();return}
    var b=e.target.closest('button');if(!b)return;
    var tone=b.getAttribute('data-zh-tone'),act=b.getAttribute('data-zh');
    if(tone){cfg.tone=tone;save(cfg);applyTone();syncSheet();return}
    if(act==='close')closeSheet();
    else if(act==='theme'){var t=themeBtn();if(t)t.click();setTimeout(syncSheet,30)}
    else if(act==='swish'){setSound(!soundOn());syncSheet();var sb2=q('.fcsnd');if(sb2){var on2=soundOn();sb2.setAttribute('aria-pressed',String(on2));sb2.innerHTML=sb2.innerHTML.replace(/<svg[\s\S]*<\/svg>/,on2?SND_ON:SND_OFF)}}
    else if(act==='slow'){var s=slowBtn();if(s)s.click();setTimeout(syncSheet,30)}
  });
  sheet.addEventListener('keydown',function(e){
    if(e.key==='Escape'){e.preventDefault();closeSheet();return}
    if(e.key!=='Tab')return;
    var f=sheet.querySelectorAll('button'),first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
}
function setPressed(el,on){if(el)el.setAttribute('aria-pressed',String(!!on))}
function syncSheet(){
  if(!sheet)return;
  var tb=q('[data-zh="theme"]',sheet),sb=q('[data-zh="slow"]',sheet),sl=slowBtn();
  setPressed(tb,isDark());q('[data-zh="themestate"]',sheet).textContent=isDark()?'مفعّل':'متوقف';
  if(sb&&sl){var on=sl.getAttribute('aria-pressed')==='true';setPressed(sb,on);q('[data-zh="slowstate"]',sheet).textContent=on?'مفعّل':'متوقف'}
  var wb=q('[data-zh="swish"]',sheet);if(wb){setPressed(wb,soundOn());q('[data-zh="swishstate"]',sheet).textContent=soundOn()?'مفعّل':'متوقف'}
  var bs=sheet.querySelectorAll('[data-zh-tone]');
  for(var i=0;i<bs.length;i++)setPressed(bs[i],bs[i].getAttribute('data-zh-tone')===cfg.tone);
}
function openSheet(){
  if(!sheet)buildSheet();
  lastFocus=document.activeElement;syncSheet();sheet.hidden=false;
  var f=q('[data-zh-tone][aria-pressed="true"]',sheet)||q('button',sheet);if(f)f.focus();
}
function closeSheet(){if(!sheet)return;sheet.hidden=true;var f=opener||lastFocus;if(f&&f.focus)f.focus()}
function addGear(){
  var top=q('.hdr .top');if(!top||q('[data-zh="open"]',top))return;
  opener=document.createElement('button');opener.type='button';opener.className='zh-ib';
  opener.setAttribute('data-zh','open');opener.setAttribute('aria-label','الإعدادات');opener.setAttribute('aria-haspopup','dialog');
  opener.innerHTML=ICON.sliders;top.appendChild(opener);
  opener.addEventListener('click',openSheet);
}

/* ---------- pinyin helpers for typed answers (Phase 2) - no visible UI ----------
   Typed fields use the phone's own keyboard (it already has backspace and undo), so nothing is attached to them.
   These helpers are exposed as window.zhUI for tolerant grading and for splitting pinyin into syllables. */
var PY_VOWELS='aeiouüv\u0101\u00e1\u01ce\u00e0\u0113\u00e9\u011b\u00e8\u012b\u00ed\u01d0\u00ec\u014d\u00f3\u01d2\u00f2\u016b\u00fa\u01d4\u00f9\u01d6\u01d8\u01da\u01dc';
var PY_SYL=new RegExp('(?:(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?[' +PY_VOWELS+ ']+(?:ng|n|r)?[1-5]?|[1-5]|\\s+|[\\s\\S])$','i');
/* how many UTF-16 units to remove from the end of s: one pinyin syllable, or one character (surrogate pairs count once) */
function lastUnit(s,mode){
  if(!s)return 0;
  if(mode==='pinyin'){var m=PY_SYL.exec(s);return m?m[0].length:1}
  var n=s.length-1;
  if(n>0&&/[\uDC00-\uDFFF]/.test(s.charAt(n))&&/[\uD800-\uDBFF]/.test(s.charAt(n-1)))return 2;
  return 1;
}
/* "nǐhǎo" -> ["nǐ","hǎo"]; "ni3 hao3" -> ["ni3","hao3"] (spaces dropped) */
function syllables(s){
  s=String(s||'');var out=[];
  while(s){var n=lastUnit(s,'pinyin');var part=s.slice(s.length-n);s=s.slice(0,s.length-n);if(part.replace(/\s+/g,''))out.unshift(part.replace(/\s+/g,''))}
  return out;
}
/* canonical form for comparing typed pinyin: "nǐ hǎo" = "ni3hao3" = "Ni3 Hao3"; neutral tone "ma" = "ma5"; "lv4" = "lü4" */
function normPinyin(s){
  return toNumbers(String(s||'')).toLowerCase().replace(/v/g,'\u00fc').replace(/[\s'\u2019\-.,;:!?\u3002\uff0c\uff01\uff1f]+/g,'').replace(/5/g,'');
}
/* ---------- study helpers (Phase 6a): settings inside zh-ui-v1, swipe, 3D support test, badge stamp, end-of-quiz summary ---------- */
var study=cfg.study&&typeof cfg.study==='object'?cfg.study:(cfg.study={});
function pref(k,d){return study[k]===undefined?d:study[k]}
function setPref(k,v){study[k]=v;save(cfg)}
function reduced(){try{return matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){return false}}
function can3d(){try{return root.classList.contains('zh-ui')&&!reduced()&&!!window.CSS&&CSS.supports('transform-style','preserve-3d')&&CSS.supports('backface-visibility','hidden')}catch(e){return false}}
/* swipe(host, selector, cb): a horizontal drag (at least 45px and clearly more sideways than up/down) on an element matching selector calls cb('left'|'right', element);
   the tap that follows a swipe is swallowed, so a swipe never also flips a card. Vertical scrolling is untouched (the element needs touch-action:pan-y in CSS). */
function swipe(host,sel,cb){
  var x0=0,y0=0,el=null,swiped=false;
  host.addEventListener('pointerdown',function(e){el=e.target.closest&&e.target.closest(sel);if(!el||(e.pointerType==='mouse'&&e.button!==0)){el=null;return}x0=e.clientX;y0=e.clientY;swiped=false});
  host.addEventListener('pointerup',function(e){
    if(!el)return;var dx=e.clientX-x0,dy=e.clientY-y0,t=el;el=null;
    if(Math.abs(dx)>=45&&Math.abs(dx)>1.6*Math.abs(dy)){swiped=true;cb(dx<0?'left':'right',t);setTimeout(function(){swiped=false},400)}
  });
  host.addEventListener('pointercancel',function(){el=null});
  host.addEventListener('click',function(e){if(swiped&&e.target.closest&&e.target.closest(sel)){swiped=false;e.stopPropagation();e.preventDefault()}},true);
}
function esc2(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
/* badges: earned = a red seal stamp, not yet earned = a dashed ring with a padlock (clearly not an empty slot) */
function badges(list){
  return '<div class="badges zhb">'+list.map(function(b){
    return '<div class="badge'+(b.on?' on':'')+(b.isNew?' new':'')+'" role="img" aria-label="'+esc2(b.n)+(b.on?' (مكتسب)':' (مقفل)')+'"><span lang="zh">'+b.g+'</span>'+b.n+'</div>';
  }).join('')+'</div>';
}
var stampT=null;
function stamp(g,name){
  var old=document.querySelector('.zh-stamp');if(old)old.remove();clearTimeout(stampT);
  var d=document.createElement('div');d.className='zh-stamp';d.setAttribute('role','status');
  d.innerHTML='<div class="zh-seal"><span lang="zh">'+g+'</span></div><b>وسام جديد</b><span>'+esc2(name)+'</span>';
  document.body.appendChild(d);stampT=setTimeout(function(){d.remove()},3200);
}
/* summary(o): the end-of-quiz screen. o: starsHtml, msg, score, n, pct, gain, level (0 or the new level), newBadges [{g,n}], missedHtml, badgesHtml, retryKind, next {href,label} */
function summary(o){
  var h='<div class="res sum">'+o.starsHtml+'<h3>'+o.msg+'</h3>'+
   '<div class="sumrow"><div class="sumbox"><b class="ltr">'+o.score+' / '+o.n+'</b><small>النتيجة</small></div><div class="sumbox"><b class="ltr">'+o.pct+'%</b><small>الدقة</small></div><div class="sumbox"><b class="ltr">+'+o.gain+'</b><small>نقطة</small></div></div>'+
   (o.level?'<p class="mut">وصلتَ إلى المستوى '+o.level+'</p>':'');
  if(o.newBadges&&o.newBadges.length)h+='<div class="newb"><b>وسام جديد</b>'+o.newBadges.map(function(b){return '<div class="zh-seal big"><span lang="zh">'+b.g+'</span></div><span>'+esc2(b.n)+'</span>'}).join('')+'</div>';
  if(o.missedHtml)h+='<div class="miss"><h4>كلمات تحتاج تدريباً</h4>'+o.missedHtml+'<button class="btn ghost" data-act="addmiss">أضفها إلى المراجعة</button></div>';
  h+='<div class="sumb"><h4>أوسمتك</h4>'+o.badgesHtml+'</div>';
  h+='<div class="sumact"><button class="btn primary" data-act="start" data-k="'+o.retryKind+'">أعد المحاولة</button><button class="btn ghost" data-act="qexit">كل التمارين</button>'+
     (o.next?'<a class="btn ghost" href="'+esc2(o.next.href)+'">'+esc2(o.next.label)+'</a>':'')+'</div></div>';
  return h;
}
/* ---------- page-turn sound: a short filtered-noise swish made with Web Audio (no audio files). OFF by default, saved in zh-ui-v1 (study.sound).
   The AudioContext is created / resumed only inside a user gesture (a pointerdown or key press), and only when the sound is on; any failure is silent. ---------- */
var AC=null,acFail=false;
function soundOn(){return !!pref('sound',0)}
function audioPrime(){
  if(!soundOn()||acFail)return;
  try{
    if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(!C){acFail=true;return}AC=new C()}
    if(AC.state==='suspended'&&AC.resume){var r=AC.resume();if(r&&r.catch)r.catch(function(){})}
  }catch(e){acFail=true;AC=null}
}
function swish(){
  if(!soundOn()||!AC||acFail)return;
  try{
    var t=AC.currentTime,dur=.17,n=Math.max(1,Math.floor(AC.sampleRate*dur)),buf=AC.createBuffer(1,n,AC.sampleRate),d=buf.getChannelData(0);
    for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    var src=AC.createBufferSource();src.buffer=buf;
    var f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=.9;f.frequency.setValueAtTime(650,t);f.frequency.exponentialRampToValueAtTime(2800,t+dur);
    var g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.14,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(f);f.connect(g);g.connect(AC.destination);src.start(t);src.stop(t+dur+.02);
  }catch(e){}
}
function setSound(on){setPref('sound',on?1:0);if(on)audioPrime()}
document.addEventListener('pointerdown',audioPrime,true);document.addEventListener('keydown',audioPrime,true);
/* cardDrag(host, o): the flashcard turns like a page under the finger. o: sel (the card), enabled(), under('next'|'prev') -> html of the card that is revealed, commit('next'|'prev').
   While a horizontal drag runs (pointer events + setPointerCapture, rAF updates) the card rotates around its vertical edge nearest the swipe direction by dx/width*180 degrees.
   On release: past 35% of the width, or a fast flick, the turn completes (about 620ms, ease-in-out); otherwise it springs back. The element needs touch-action:pan-y so vertical scrolling stays native. */
function cardDrag(host,o){
  var st=null,raf=0,dx=0,busy=false,swiped=false;
  function W(){return (st&&st.el.clientWidth)||320}
  function prep(dir){st.dir=dir;var u=st.el.querySelector('.fcu');if(u)u.innerHTML=o.under(dir<0?'next':'prev')}
  function paint(a,dir){var pg=st.pg;pg.style.transformOrigin=dir<0?'0% 50%':'100% 50%';pg.style.transform='rotateY('+a.toFixed(2)+'deg)';st.el.classList.toggle('past',Math.abs(a)>90);st.el.style.setProperty('--sh',Math.sin(Math.abs(a)*Math.PI/180).toFixed(3))}
  function frame(){raf=0;if(!st||!st.drag)return;var a=Math.max(-180,Math.min(180,dx/W()*180)),dir=dx<0?-1:1;if(dir!==st.dir)prep(dir);paint(a,dir)}
  function clear(el){el.classList.remove('dragging','settling','past');el.style.removeProperty('--sh');var pg=el.querySelector('.fcp');if(pg){pg.style.transition='';pg.style.transform='';pg.style.transformOrigin=''}var u=el.querySelector('.fcu');if(u)u.innerHTML=''}
  host.addEventListener('pointerdown',function(e){
    if(busy||!o.enabled()||(e.pointerType==='mouse'&&e.button!==0))return;
    var el=e.target.closest&&e.target.closest(o.sel);if(!el||e.target.closest('button,a,input,textarea'))return;
    var pg=el.querySelector('.fcp');if(!pg)return;
    st={el:el,pg:pg,id:e.pointerId,x0:e.clientX,y0:e.clientY,drag:false,dir:0,s:[[e.timeStamp,e.clientX]]};dx=0;
  });
  host.addEventListener('pointermove',function(e){
    if(!st||e.pointerId!==st.id)return;
    dx=e.clientX-st.x0;var dy=e.clientY-st.y0;st.s.push([e.timeStamp,e.clientX]);while(st.s.length>2&&e.timeStamp-st.s[0][0]>120)st.s.shift();
    if(!st.drag){
      if(Math.abs(dx)>8&&Math.abs(dx)>1.3*Math.abs(dy)){st.drag=true;try{st.el.setPointerCapture(st.id)}catch(x){}st.el.classList.add('dragging');st.pg.style.transition='none';prep(dx<0?-1:1)}
      else return;
    }
    if(!raf)raf=requestAnimationFrame(frame);
  });
  function end(e,cancel){
    if(!st||e.pointerId!==st.id)return;var s=st;st=null;
    if(!s.drag)return;
    if(raf){cancelAnimationFrame(raf);raf=0}
    try{s.el.releasePointerCapture(s.id)}catch(x){}
    swiped=true;setTimeout(function(){swiped=false},450);
    var w=s.el.clientWidth||320,dir=dx<0?-1:1,a0=Math.max(-180,Math.min(180,dx/w*180));
    var a=s.s[0],b=s.s[s.s.length-1],v=b[0]>a[0]?(b[1]-a[1])/(b[0]-a[0]):0;if(e.timeStamp-b[0]>80)v=0;   /* the finger rested before letting go: not a flick */
    var go=!cancel&&(Math.abs(dx)>.35*w||(Math.abs(v)>.5&&Math.sign(v)===dir));
    st=s;paint(a0,dir);st=null;
    var pg=s.pg;busy=true;void pg.offsetWidth;
    if(go){
      pg.style.transition='transform .62s cubic-bezier(.45,0,.55,1)';pg.style.transform='rotateY('+(dir*180)+'deg)';s.el.classList.add('settling');
      if(Math.abs(a0)<=90)setTimeout(function(){s.el.classList.add('past')},310*(90-Math.abs(a0))/(180-Math.abs(a0))+10);
      setTimeout(function(){busy=false;o.commit(dir<0?'next':'prev')},650);
    }else{
      pg.style.transition='transform .42s cubic-bezier(.22,1.25,.4,1)';pg.style.transform='rotateY(0deg)';s.el.style.setProperty('--sh','0');
      setTimeout(function(){busy=false;clear(s.el)},460);
      setTimeout(function(){s.el.classList.remove('past')},120);
    }
  }
  host.addEventListener('pointerup',function(e){end(e,false)});
  host.addEventListener('pointercancel',function(e){end(e,true)});
  host.addEventListener('click',function(e){if((swiped||busy)&&e.target.closest&&e.target.closest(o.sel)){e.stopPropagation();e.preventDefault()}},true);
}
window.zhUI={toNumbers:toNumbers,normPinyin:normPinyin,syllables:syllables,lastUnit:lastUnit,track:function(){trackActivity()},dayKey:dayKey,voiceStatus:function(){return voiceStatus()},pref:pref,setPref:setPref,can3d:can3d,swipe:swipe,badges:badges,stamp:stamp,summary:summary,soundOn:soundOn,setSound:setSound,audioPrime:audioPrime,swish:swish,cardDrag:cardDrag};

/* ---------- quiet hint when the device has no Chinese voice ---------- */
var voiceChecked=false;
function showVoiceHint(msg){
  var hdr=q('.hdr');if(!hdr||q('.zh-voice'))return;
  var bar=document.createElement('div');bar.className='zh-voice';bar.setAttribute('role','status');
  bar.innerHTML='<span></span><button type="button" aria-label="إخفاء التنبيه">إخفاء</button>';
  bar.firstChild.textContent=msg;
  bar.lastChild.addEventListener('click',function(){cfg.voiceHint='off';save(cfg);if(bar.parentNode)bar.parentNode.removeChild(bar)});
  hdr.parentNode.insertBefore(bar,hdr.nextSibling);
}
var VOICE_NOSUPPORT='هذا المتصفح لا يدعم النطق الصوتي، لذلك لن تسمع الجمل. جرّب متصفحاً حديثاً مثل Chrome أو Safari.';
var VOICE_NONE='لم نجد صوتاً صينياً على جهازك، لذلك قد لا يعمل النطق. ثبّت صوت اللغة الصينية من إعدادات الصوت في جهازك، أو جرّب متصفحاً آخر.';
/* the same detection as the hint below, as a value (used by the hub's listening games):
   s = 'yes' (a zh/cmn/yue voice exists) | 'no' | 'nosupport' | 'unknown' (voices not listed yet: say nothing rather than raise a false alarm) */
function voiceStatus(){
  var ss=window.speechSynthesis;
  if(!ss)return {s:'nosupport',msg:VOICE_NOSUPPORT,short:'النطق الصوتي غير مدعوم في هذا المتصفح'};
  var v=ss.getVoices?ss.getVoices():[];
  if(!v.length)return {s:'unknown'};
  for(var i=0;i<v.length;i++){if(/^(zh|cmn|yue)/i.test(v[i].lang||''))return {s:'yes'}}
  return {s:'no',msg:VOICE_NONE,short:'لا يوجد صوت صيني على جهازك'};
}
function checkVoice(){
  if(voiceChecked||cfg.voiceHint==='off')return;
  var ss=window.speechSynthesis;
  if(!ss){voiceChecked=true;showVoiceHint(VOICE_NOSUPPORT);return}
  function decide(final){
    if(voiceChecked)return;
    var v=ss.getVoices?ss.getVoices():[];
    if(!v.length){return}                       /* voices not listed (yet): say nothing rather than raise a false alarm */
    voiceChecked=true;
    var zh=false;for(var i=0;i<v.length;i++){if(/^(zh|cmn|yue)/i.test(v[i].lang||'')){zh=true;break}}
    if(!zh)showVoiceHint(VOICE_NONE);
  }
  decide();
  if(!voiceChecked){
    if(ss.addEventListener)ss.addEventListener('voiceschanged',function(){decide()});else ss.onvoiceschanged=function(){decide()};
    setTimeout(decide,2500);
  }
}

/* ---------- back arrow of lessons shared by Grammar and Foreign Language ----------
   lesson-N.html belongs to both courses, so its static back arrow points at Grammar. The hub remembers the last course the
   student opened (zh-hub-v1.lastCourse); if that was Foreign Language the arrow is sent there instead. Default stays Grammar,
   and lessons of every other course are never changed. */
function backToLastCourse(){
  var a=q('.zh-back');if(!a)return;
  if((a.getAttribute('href')||'').indexOf('#gram')<0)return;
  try{var s=JSON.parse(localStorage.getItem('zh-hub-v1')||'{}');if(s&&s.lastCourse==='fl')a.setAttribute('href','index.html#fl')}catch(e){}
}

/* ---------- study activity for the hub dashboard ----------
   Lessons and the hub load this file, so it is the one place that notices study activity without touching any lesson page:
   - zh-hub-v1.lastLesson = the lesson file the student opened last (the hub's "continue" card);
   - zh-hub-v1.pts[YYYY-MM-DD] = points earned that day = growth of the XP stored in the lessons' own keys (noor-*-v1);
     zh-hub-v1.xpSum is the XP total seen last time (the first run only takes a snapshot, nothing is credited retroactively);
   - zh-hub-v1.days gets today's date (the streak calendar) as soon as there is any activity.
   Everything lives inside the existing key; old data without these fields keeps working. Dates are local (YYYY-MM-DD). */
var HUBK='zh-hub-v1';
function dayKey(d){d=d||new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function hubRead(){try{var h=JSON.parse(localStorage.getItem(HUBK)||'{}');return h&&typeof h==='object'?h:{}}catch(e){return {}}}
function hubWrite(h){try{localStorage.setItem(HUBK,JSON.stringify(h));return true}catch(e){return false}}
function lessonXp(){var t=0;try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^noor-[a-z0-9]+-v1$/.test(k)){var v=JSON.parse(localStorage.getItem(k));if(v&&typeof v.xp==='number')t+=v.xp}}}catch(e){}return t}
function markDayIn(h){var t=dayKey();h.days=h.days||[];if(h.days.indexOf(t)<0){h.days.push(t);h.days=h.days.slice(-400)}}
function trimPts(h){var ks=Object.keys(h.pts||{}).sort();while(ks.length>90){delete h.pts[ks.shift()]}}
function trackActivity(){
  try{
    var h=hubRead(),now=lessonXp(),changed=false;
    if(typeof h.xpSum!=='number'||now<h.xpSum){h.xpSum=now;changed=true}      /* first run (or progress was reset): snapshot only */
    else if(now>h.xpSum){var t=dayKey();h.pts=h.pts||{};h.pts[t]=(h.pts[t]||0)+(now-h.xpSum);h.xpSum=now;markDayIn(h);trimPts(h);changed=true}
    if(changed&&hubWrite(h))window.dispatchEvent(new Event('zh-hub-updated'));
  }catch(e){}
}
function markLesson(){
  var m=/(?:^|\/)((?:lesson|prac|lis|biz|cult)-\d+)(?:\.html)?$/.exec(location.pathname);if(!m)return;
  var f=m[1]+'.html',h=hubRead();
  if(h.lastLesson!==f){h.lastLesson=f;hubWrite(h)}
}
function startTracking(){
  markLesson();trackActivity();
  setInterval(function(){if(!document.hidden)trackActivity()},8000);
  document.addEventListener('visibilitychange',function(){if(document.hidden)trackActivity()});
  window.addEventListener('pagehide',trackActivity);
}

/* ---------- init ---------- */
function cssLoaded(){return !!getComputedStyle(root).getPropertyValue('--zh-ui').trim()}
function init(){
  if(!document.body)return;
  processNode(document.body);
  watch();
  if(cssLoaded()){addGear();root.classList.add('zh-ui')}
  else window.addEventListener('load',function(){if(cssLoaded()&&!root.classList.contains('zh-ui')){addGear();root.classList.add('zh-ui')}});
  backToLastCourse();
  startTracking();
  if(cssLoaded())checkVoice();
}
if(cfg.tone!=='color')root.setAttribute('data-tone',cfg.tone);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
