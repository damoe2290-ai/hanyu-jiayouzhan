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
  enhanceEditors(n);                       /* before the skip below: a field added on its own must still get its tools */
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
function q(s,r){return (r||document).querySelector(s)}
function themeBtn(){return q('.hdr [data-act="theme"]')||q('#th')}
function slowBtn(){return q('#slowbtn')}
function isDark(){var d=root.getAttribute('data-theme');return d?d==='dark':!!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)}
function buildSheet(){
  var h='<div class="zh-sheet" role="document"><h2><span id="zh-set-t">الإعدادات</span><button type="button" class="zh-ib" data-zh="close" aria-label="إغلاق">'+ICON.close+'</button></h2>';
  h+='<h3>المظهر</h3><button type="button" class="zh-row" data-zh="theme" aria-pressed="false"><span>الوضع الليلي</span><span data-zh="themestate"></span></button>';
  if(slowBtn())h+='<h3>الصوت</h3><button type="button" class="zh-row" data-zh="slow" aria-pressed="false"><span>صوت بطيء</span><span data-zh="slowstate"></span></button>';
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

/* ---------- typing helper: delete one character / syllable, undo, clear all ----------
   Any field marked data-zh-editor="zh" (Chinese text) or "pinyin" gets a small toolbar. Works with phrase chips that
   insert text: the page dispatches an 'input' event after changing the value, which is what the undo history records.
   Without this file the field is still a normal textarea/input. */
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
function setField(el,val,caret){
  el.value=val;
  try{el.setSelectionRange(caret,caret)}catch(x){}
  el.dispatchEvent(new Event('input',{bubbles:true}));
}
function backspaceField(el,mode){
  var a=el.selectionStart==null?el.value.length:el.selectionStart,b=el.selectionEnd==null?a:el.selectionEnd,v=el.value;
  if(a!==b){setField(el,v.slice(0,a)+v.slice(b),a);return}
  var n=lastUnit(v.slice(0,a),mode);if(!n)return;
  setField(el,v.slice(0,a-n)+v.slice(a),a-n);
}
function attachEditor(el){
  if(el.__zhEd||!el.parentNode)return;el.__zhEd=true;
  var mode=el.getAttribute('data-zh-editor')==='pinyin'?'pinyin':'zh';
  var st={stack:[],prev:el.value,skip:false};
  var bar=document.createElement('div');bar.className='zh-ed';bar.setAttribute('role','group');bar.setAttribute('aria-label','أدوات الكتابة');
  bar.innerHTML='<button type="button" data-zh-ed="bs" aria-label="'+(mode==='pinyin'?'حذف آخر مقطع':'حذف آخر حرف')+'">'+(mode==='pinyin'?'حذف مقطع':'حذف حرف')+'</button>'+
    '<button type="button" data-zh-ed="undo" aria-label="التراجع عن آخر تعديل">تراجع</button>'+
    '<button type="button" data-zh-ed="clear" aria-label="مسح كل النص">مسح الكل</button>';
  el.parentNode.insertBefore(bar,el.nextSibling);
  var bBs=bar.children[0],bUndo=bar.children[1],bClear=bar.children[2];
  function sync(){bBs.disabled=bClear.disabled=!el.value;bUndo.disabled=!st.stack.length}
  el.addEventListener('input',function(){
    if(st.skip){st.skip=false}
    else if(el.value!==st.prev){st.stack.push(st.prev);if(st.stack.length>60)st.stack.shift()}
    st.prev=el.value;sync();
  });
  /* keep the keyboard open and the caret in place: a tap on a toolbar button must not take focus from the field */
  bar.addEventListener('mousedown',function(e){e.preventDefault()});
  bar.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||b.disabled)return;
    var act=b.getAttribute('data-zh-ed');
    if(act==='bs')backspaceField(el,mode);
    else if(act==='clear')setField(el,'',0);
    else if(act==='undo'&&st.stack.length){var v=st.stack.pop();st.skip=true;setField(el,v,v.length)}
    sync();
  });
  sync();
}
function enhanceEditors(root){
  if(!root||root.nodeType!==1||!cssLoaded())return;
  var list=[];
  if(root.matches&&root.matches('[data-zh-editor]'))list.push(root);
  if(root.querySelectorAll){var q2=root.querySelectorAll('[data-zh-editor]');for(var i=0;i<q2.length;i++)list.push(q2[i])}
  list.forEach(attachEditor);
}

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
function checkVoice(){
  if(voiceChecked||cfg.voiceHint==='off')return;
  var ss=window.speechSynthesis;
  if(!ss){voiceChecked=true;showVoiceHint('هذا المتصفح لا يدعم النطق الصوتي، لذلك لن تسمع الجمل. جرّب متصفحاً حديثاً مثل Chrome أو Safari.');return}
  function decide(final){
    if(voiceChecked)return;
    var v=ss.getVoices?ss.getVoices():[];
    if(!v.length){return}                       /* voices not listed (yet): say nothing rather than raise a false alarm */
    voiceChecked=true;
    var zh=false;for(var i=0;i<v.length;i++){if(/^(zh|cmn|yue)/i.test(v[i].lang||'')){zh=true;break}}
    if(!zh)showVoiceHint('لم نجد صوتاً صينياً على جهازك، لذلك قد لا يعمل النطق. ثبّت صوت اللغة الصينية من إعدادات الصوت في جهازك، أو جرّب متصفحاً آخر.');
  }
  decide();
  if(!voiceChecked){
    if(ss.addEventListener)ss.addEventListener('voiceschanged',function(){decide()});else ss.onvoiceschanged=function(){decide()};
    setTimeout(decide,2500);
  }
}

/* ---------- init ---------- */
function cssLoaded(){return !!getComputedStyle(root).getPropertyValue('--zh-ui').trim()}
function init(){
  if(!document.body)return;
  processNode(document.body);
  watch();
  if(cssLoaded()){addGear();root.classList.add('zh-ui')}
  else window.addEventListener('load',function(){if(cssLoaded()&&!root.classList.contains('zh-ui')){addGear();root.classList.add('zh-ui')}});
  if(cssLoaded())checkVoice();
}
if(cfg.tone!=='color')root.setAttribute('data-tone',cfg.tone);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
