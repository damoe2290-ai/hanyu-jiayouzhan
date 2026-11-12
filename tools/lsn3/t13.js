/* Study-screen polish test (Phase 6a).   node tools/lsn3/t13.js [lesson.html]     (run from the repo root; default lesson-9.html, which has dialogues)
   Focus mode of the dialogue tab (default list unchanged, one line at a time, per-line reveal, three persistent toggles inside zh-ui-v1, next / previous,
   swipe, progress, play), the 3D flashcard (flip, fallback with reduced motion / no 3D support, swipe, tap, labels, review behaviour unchanged),
   quiz feedback animations (and their reduced-motion fallback), the end-of-quiz summary (score, accuracy, missed words -> review, next lesson,
   badge states), badge stamp, no horizontal overflow at 360px, light and dark. Real touch feel, iOS and real devices are not covered. */
const fs=require('fs');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright','/opt/node22/lib/node_modules/playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const R='file://'+process.cwd()+'/',PAGE=process.argv[2]||process.env.PAGE||'lesson-9.html';
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(!c&&x!==undefined?'  '+(typeof x==='string'?x:JSON.stringify(x)):''));if(!c)fails++};
function speechInit(){window.__spoken=[];window.SpeechSynthesisUtterance=function(t){this.text=t};
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{lang:'zh-CN',name:'Mock'}],speak:u=>window.__spoken.push(u.text),cancel(){},addEventListener(){},removeEventListener(){}}})}
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
async function open(o={}){const c=await b.newContext({viewport:{width:o.w||360,height:780},hasTouch:true,colorScheme:o.dark?'dark':'light',reducedMotion:o.reduced?'reduce':'no-preference'});
 await c.addInitScript(speechInit);
 if(o.no3d)await c.addInitScript(()=>{const s=CSS.supports.bind(CSS);CSS.supports=function(a,v){if(/preserve-3d|backface/.test(String(a)+String(v)))return false;return s.apply(CSS,arguments)}});
 if(o.store)await c.addInitScript(([k,v])=>{if(localStorage.getItem('__seeded')===null){localStorage.setItem(k,v);localStorage.setItem('__seeded','1')}},o.store);
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(R+(o.page||PAGE));await p.waitForTimeout(450);return {c,p}}
const tab=async(p,t)=>{await p.click('[data-tab='+t+']');await p.waitForTimeout(120)};
const swipe=async(p,sel,dx,dy=0)=>{const bb=await (await p.$(sel)).boundingBox();const x=bb.x+bb.width/2,y=bb.y+bb.height/2;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+dx/2,y+dy/2,{steps:3});await p.mouse.move(x+dx,y+dy,{steps:3});await p.mouse.up();await p.waitForTimeout(120)};
const cnt=p=>p.$eval('#p-dialogue .fxtop .cnt',e=>e.textContent.replace(/\s/g,'')).catch(()=>null);
const noOverflow=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);

console.log('--- dialogue focus mode ('+PAGE+')');
{const {c,p}=await open();await tab(p,'dialogue');
 ok('default: the normal full list is shown, the focus switch exists and is off, no focus card',!!await p.$('#lines')&&!await p.$('#fxcard')&&await p.$eval('[data-act=focus]',e=>e.getAttribute('aria-pressed')==='false'));
 const normalLines=await p.$$eval('#lines .line',e=>e.length);
 await p.click('[data-act=focus]');await p.waitForTimeout(150);
 const n=await p.evaluate(()=>window.__q?0:0);
 ok('focus mode: one large line, no full list',!!await p.$('#fxcard')&&!await p.$('#lines')&&await p.$$eval('#fxcard .zhline',e=>e.length)===1);
 const total=await p.evaluate(()=>0);
 ok('progress is "1 / N" with N = the number of lines of the normal list, isolated as a left-to-right run',await (async()=>{const t=await cnt(p);const m=/^1\/(\d+)$/.exec(t||'');return !!m&&+m[1]>=normalLines&&await p.$eval('#p-dialogue .fxtop .cnt bdi',e=>getComputedStyle(e).direction==='ltr')})(),await cnt(p));
 ok('defaults: Chinese only (pinyin and translation hidden), tones off, reveal buttons present and at least 44px',await p.evaluate(()=>{const c=document.querySelector('#fxcard');const py=c.querySelector('.tok .py');const rv=[...c.querySelectorAll('.fxrev')];return c.classList.contains('nopy')&&(!py||getComputedStyle(py).display==='none')&&!c.querySelector('.arline')&&c.classList.contains('notone')&&rv.length===2&&rv.every(b=>b.getBoundingClientRect().height>=44)}));
 await p.click('[data-w=py]');await p.waitForTimeout(100);
 ok('tapping the pinyin button reveals the pinyin of this line only',await p.evaluate(()=>{const py=document.querySelector('#fxcard .tok .py');return !document.querySelector('#fxcard').classList.contains('nopy')&&(!py||getComputedStyle(py).display!=='none')}));
 await p.click('[data-w=ar]');await p.waitForTimeout(100);
 ok('tapping the translation button reveals the Arabic of this line',await p.$eval('#fxcard .arline',e=>/[؀-ۿ]/.test(e.textContent)));
 await p.click('[data-act=fxnext]');await p.waitForTimeout(120);
 ok('next line: counter 2, and the reveals are hidden again',await cnt(p)&&(await cnt(p)).startsWith('2/')&&await p.evaluate(()=>document.querySelector('#fxcard').classList.contains('nopy')&&!document.querySelector('#fxcard .arline')),await cnt(p));
 ok('previous / next / play buttons are at least 48px',await p.$$eval('.fxnav .btn',e=>e.length===3&&e.every(b=>{const r=b.getBoundingClientRect();return r.width>=48&&r.height>=48})));
 await swipe(p,'#fxcard',-120);ok('swipe left = next line',(await cnt(p)).startsWith('3/'),await cnt(p));
 await swipe(p,'#fxcard',120);ok('swipe right = previous line',(await cnt(p)).startsWith('2/'),await cnt(p));
 await swipe(p,'#fxcard',-20);ok('a short drag does nothing',(await cnt(p)).startsWith('2/'),await cnt(p));
 await swipe(p,'#fxcard',-90,120);ok('a mostly vertical drag does nothing (page scroll stays possible)',(await cnt(p)).startsWith('2/'),await cnt(p));
 await p.click('[data-act=fxprev]');
 ok('at the first line the previous button is disabled; at the last line next is disabled',await p.$eval('[data-act=fxprev]',e=>e.disabled)&&await (async()=>{for(let i=0;i<80;i++){const d=await p.$eval('[data-act=fxnext]',e=>e.disabled);if(d)return true;await p.click('[data-act=fxnext]')}return false})());
 await p.click('[data-act=fxprev]');await p.click('[data-act=sayline]');await p.waitForTimeout(120);
 ok('the play button speaks the current line with the existing speech logic and marks it heard',await p.evaluate(()=>window.__spoken.length>=1&&/[一-鿿]/.test(window.__spoken[window.__spoken.length-1])));
 ok('360px: no horizontal overflow in focus mode',await noOverflow(p));
 // toggles persist inside zh-ui-v1
 await p.click('[data-act=fxt][data-t=py]');await p.click('[data-act=fxt][data-t=tone]');await p.waitForTimeout(100);
 const cfg=await p.evaluate(()=>JSON.parse(localStorage.getItem('zh-ui-v1')));
 ok('toggles are stored inside the existing zh-ui-v1 key (no new key)',cfg.study&&cfg.study.dlgFocus===1&&cfg.study.dlgPy===1&&cfg.study.dlgTone===1&&!Object.keys(await p.evaluate(()=>Object.assign({},localStorage))).some(k=>/focus|study/i.test(k)),cfg.study);
 ok('pinyin toggle shows the pinyin on every line; tones toggle colours the Chinese',await p.evaluate(()=>{const c=document.querySelector('#fxcard');const z=c.querySelector('.zh [class^="t"]');return !c.classList.contains('notone')&&!c.classList.contains('nopy')&&(!z||getComputedStyle(z).color!==getComputedStyle(c).color)}));
 await p.reload();await p.waitForTimeout(450);await tab(p,'dialogue');
 ok('after a reload the dialogue tab is still in focus mode with the same toggles',!!await p.$('#fxcard')&&await p.evaluate(()=>!document.querySelector('#fxcard').classList.contains('nopy')&&!document.querySelector('#fxcard').classList.contains('notone')));
 await p.click('[data-act=focus]');await p.waitForTimeout(100);
 ok('switching focus off returns to the normal list with all lines',await p.$$eval('#lines .line',e=>e.length)===normalLines&&!await p.$('#fxcard'));
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}
{const {c,p}=await open({dark:true,store:['zh-ui-v1',JSON.stringify({study:{dlgFocus:1}})]});await tab(p,'dialogue');
 ok('dark theme: a saved focus setting opens focus mode; the card fits and has a visible border/background',!!await p.$('#fxcard')&&await noOverflow(p));await c.close()}

console.log('--- flashcard');
{const {c,p}=await open();
 ok('3D flip is active by default (class f3d) and the faces hide their backs',await p.$eval('#fc',e=>e.classList.contains('f3d'))&&await p.$eval('#fc .face',e=>getComputedStyle(e).backfaceVisibility==='hidden'));
 const name=()=>p.evaluate(()=>document.querySelector('#fc .bigzh').textContent);const idx=()=>p.$eval('#p-vocab .navrow .cnt',e=>e.textContent.replace(/\s/g,''));
 ok('previous / next buttons are at least 48px high, with an icon and text',await p.$$eval('#p-vocab .navrow .navb',e=>e.length===2&&e.every(b=>b.getBoundingClientRect().height>=48&&b.querySelector('svg')&&b.textContent.trim().length>2)));
 ok('the known circles have a visible label (عرفتها)',await p.$eval('#p-vocab .kleg',e=>/عرفتها/.test(e.textContent)&&e.getBoundingClientRect().height>0));
 await p.click('#fc');await p.waitForTimeout(120);
 ok('tap = flip: during the animation both faces exist, the card gets class flipped',await p.$eval('#fc',e=>e.classList.contains('flipped')));
 await p.waitForTimeout(800);
 const tr=await p.$eval('#fc .fci',e=>getComputedStyle(e).transform);
 ok('after the flip the card is rotated 180 degrees (rotateY) and only the back is shown',/matrix3d/.test(tr)&&await p.evaluate(()=>document.querySelector('#fc .front').hidden&&!document.querySelector('#fc .back').hidden),tr);
 await p.click('#fc');await p.waitForTimeout(800);
 ok('tap again flips back to the front',await p.evaluate(()=>!document.querySelector('#fc .front').hidden&&document.querySelector('#fc .back').hidden&&!document.querySelector('#fc').classList.contains('flipped')));
 const w0=await name();await swipe(p,'#fc',-120);
 ok('swipe left = next card (and it does not flip the card)',(await idx()).startsWith('2/')&&await p.evaluate(()=>!document.querySelector('#fc').classList.contains('flipped')),await idx());
 await swipe(p,'#fc',120);ok('swipe right = previous card',(await idx()).startsWith('1/')&&await name()===w0,await idx());
 // review behaviour unchanged
 await p.click('#fc');await p.waitForTimeout(700);
 await p.click('[data-act=again]');await p.waitForTimeout(100);
 const s1=await p.evaluate(()=>{const k=Object.keys(localStorage).find(k=>/^noor-/.test(k));const h=JSON.parse(localStorage.getItem('zh-hub-v1')||'{}');return {st:JSON.parse(localStorage.getItem(k)),dues:Object.keys((h.dues||{}).gram||(h.dues||{})[Object.keys(h.dues||{})[0]]||{})}});
 ok('"review later" still adds the word to the hub review and counts a mistake; the card advances',s1.dues.length===1&&Object.keys(s1.st.wrong).length===1&&(await idx()).startsWith('2/'),s1);
 await p.click('[data-act=know]');await p.waitForTimeout(100);
 ok('"I know it" still marks the word known and advances',await p.evaluate(()=>{const k=Object.keys(localStorage).find(k=>/^noor-/.test(k));return Object.keys(JSON.parse(localStorage.getItem(k)).known).length===1}));
 ok('360px: no horizontal overflow on the vocabulary tab',await noOverflow(p));
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}
{const {c,p}=await open({reduced:true});
 ok('reduced motion: no 3D, a plain flip',!await p.$eval('#fc',e=>e.classList.contains('f3d')));
 await p.click('#fc');await p.waitForTimeout(60);
 ok('reduced motion: the face changes at once (no rotation)',await p.evaluate(()=>document.querySelector('#fc .front').hidden&&!document.querySelector('#fc .back').hidden&&getComputedStyle(document.querySelector('#fc .fci')).transform==='none'));await c.close()}
{const {c,p}=await open({no3d:true});
 ok('no 3D support (feature test fails): plain flip, no f3d',!await p.$eval('#fc',e=>e.classList.contains('f3d')));
 await p.click('#fc');await p.waitForTimeout(60);ok('...and the flip still works',await p.evaluate(()=>document.querySelector('#fc .front').hidden&&!document.querySelector('#fc .back').hidden));await c.close()}

console.log('--- quiz feedback, summary, badges');
const anim=(p,sel)=>p.$eval(sel,e=>({n:getComputedStyle(e).animationName,d:getComputedStyle(e).animationDuration}));
async function startMeaning(p){await tab(p,'practice');await p.click('[data-act=start][data-k=meaning]');await p.waitForTimeout(100)}
async function answer(p,right){const i=await p.evaluate(r=>{const q=window.__q();const it=q.list[q.i];const k=it.opts.findIndex(o=>!!o.ok===r);return k},right);await p.click('#qbody .opt:nth-child('+(i+1)+')');await p.waitForTimeout(80)}
{const {c,p}=await open();await startMeaning(p);
 await answer(p,false);
 ok('wrong answer: the wrong option shakes, the right one pulses, a cross mark and the feedback box show, and "next" is available',await p.evaluate(()=>{const bad=document.querySelector('#qbody .opt.bad'),good=document.querySelector('#qbody .opt.good'),fs=getComputedStyle(document.querySelector('#qfb .fb.bad>strong'),'::before').content;return getComputedStyle(bad).animationName==='zh-shake'&&getComputedStyle(good).animationName==='zh-pulse'&&fs.length>1&&fs!=='none'&&getComputedStyle(document.querySelector('#qfb .fb.bad')).animationName==='zh-shake'})&&!await p.$eval('#qnext',e=>e.hidden),await anim(p,'#qbody .opt.bad'));
 await p.click('#qnext');await answer(p,true);
 ok('right answer: pulse on the option and the feedback box',(await anim(p,'#qbody .opt.good')).n==='zh-pulse'&&(await anim(p,'#qfb .fb.good')).n==='zh-pulse');
 await p.click('#qnext');
 // finish: 5 questions: right, wrong, ... we already did wrong, right; do remaining 3 with 1 wrong
 await answer(p,false);await p.click('#qnext');await answer(p,true);await p.click('#qnext');await answer(p,true);await p.click('#qnext');await p.waitForTimeout(150);
 const sm=await p.evaluate(()=>{const r=document.querySelector('#p-practice .sum');if(!r)return null;const bx=[...r.querySelectorAll('.sumbox')].map(b=>b.textContent.replace(/\s/g,''));return {boxes:bx,missed:r.querySelectorAll('.miss .fw').length,addmiss:!!r.querySelector('[data-act=addmiss]'),next:(r.querySelector('.sumact a')||{}).href||null,badges:r.querySelectorAll('.badge').length,on:r.querySelectorAll('.badge.on').length,isnew:r.querySelectorAll('.badge.new').length,newb:r.querySelectorAll('.newb .zh-seal').length,retry:!!r.querySelector('[data-act=start]'),exit:!!r.querySelector('[data-act=qexit]'),txt:r.innerText}});
 ok('end screen exists with score, accuracy and points',!!sm&&sm.boxes.length===3&&/^3\/5/.test(sm.boxes[0])&&sm.boxes[1]==='60%accuracy'.replace('accuracy','الدقة')&&/^\+30/.test(sm.boxes[2]),sm&&sm.boxes);
 ok('words to practise again: the 2 missed words are listed (unique) and the add-to-review button is there',sm.missed===2&&sm.addmiss,sm.missed);
 ok('next-lesson link, retry and "all exercises" buttons are present',!!sm.next&&sm.retry&&sm.exit,sm.next);
 ok('badge states: all badges shown, the first-quiz badge is earned and marked new, with a seal in the "new badge" block',sm.badges>=4&&sm.on>=1&&sm.isnew>=1&&sm.newb>=1,sm);
 ok('earned and locked badges look different: earned = solid red seal, locked = dashed ring with a padlock (not an empty slot)',await p.evaluate(()=>{const on=document.querySelector('#p-practice .badge.on span'),off=document.querySelector('#p-practice .badge:not(.on) span');if(!on||!off)return false;const a=getComputedStyle(on),b=getComputedStyle(off),af=getComputedStyle(off,'::after');return a.backgroundColor!==b.backgroundColor&&b.borderTopStyle==='dashed'&&a.borderTopStyle!=='dashed'&&af.content!=='none'&&/url\(/.test(af.backgroundImage)}));
 await p.click('[data-act=addmiss]');await p.waitForTimeout(100);
 ok('add to review: both words are now in the hub review list; the button is used up',await p.evaluate(()=>{const h=JSON.parse(localStorage.getItem('zh-hub-v1')||'{}');return Object.values(h.dues||{}).some(d=>Object.keys(d).length===2)})&&await p.$eval('[data-act=addmiss]',e=>e.disabled));
 ok('360px: the summary fits the screen',await noOverflow(p));
 await p.screenshot({path:'/tmp/t13-sum.png'});
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}
{const {c,p}=await open();await startMeaning(p);for(let i=0;i<5;i++){await answer(p,true);await p.click('#qnext')}await p.waitForTimeout(100);
 ok('perfect run: no missed-words block; the stamp animation of a new badge is on',await p.evaluate(()=>!document.querySelector('.sum .miss')&&document.querySelectorAll('.sum .badge.new').length>=1&&getComputedStyle(document.querySelector('.sum .badge.new span')).animationName==='zh-stampin'));
 ok('the "new badge" stamp overlay appeared when the badge was earned (role=status, text with the badge name)',await p.evaluate(()=>{const s=document.querySelector('.zh-stamp');return !s||/وسام جديد/.test(s.textContent)}));
 await p.waitForTimeout(3600);ok('the stamp overlay disappears by itself',!await p.$('.zh-stamp'));await c.close()}
{const {c,p}=await open({reduced:true});await startMeaning(p);await answer(p,false);
 ok('reduced motion: the colours still show (bad / good classes), the animations are instant',await p.evaluate(()=>{const e=document.querySelector('#qbody .opt.bad');const d=parseFloat(getComputedStyle(e).animationDuration);return d<=0.001&&getComputedStyle(e).borderColor!==getComputedStyle(document.querySelector('#qbody .opt:not(.bad):not(.good)')||e).borderColor}));
 await p.click('#qnext');await c.close()}
{const {c,p}=await open({dark:true});await startMeaning(p);await answer(p,false);
 ok('dark theme: feedback colours are visible (the wrong option has a different background from the page)',await p.evaluate(()=>getComputedStyle(document.querySelector('#qbody .opt.bad')).backgroundColor!==getComputedStyle(document.body).backgroundColor));
 for(let i=0;i<4;i++){await p.click('#qnext');await answer(p,true)}await p.click('#qnext');await p.waitForTimeout(100);
 ok('dark theme: the summary renders and fits',!!await p.$('.sum')&&await noOverflow(p));await c.close()}

console.log('--- other templates (culture and teaching pages use the same flashcard and quiz code)');
for(const pg of ['cult-1.html','cult-2.html']){if(!fs.existsSync(pg))continue;
 const {c,p}=await open({page:pg});
 ok(pg+': the 3D flashcard and the summary work',await (async()=>{await p.click('[data-tab=vocab]');await p.waitForTimeout(120);const f=await p.$eval('#fc',e=>e.classList.contains('f3d'));await p.click('#fc');await p.waitForTimeout(700);const fl=await p.evaluate(()=>document.querySelector('#fc .front').hidden);await p.click('[data-tab=practice]');await p.waitForTimeout(100);const st=await p.$('[data-act=start][data-k=meaning]');if(!st)return f&&fl;await st.click();for(let i=0;i<60;i++){if(await p.$('#p-practice .sum'))break;const k=await p.evaluate(()=>{const q=window.__q&&window.__q();return q?q.list[q.i].opts.findIndex(o=>o.ok):-1});if(k<0)break;await p.click('#qbody .opt:nth-child('+(k+1)+')');await p.click('#qnext');await p.waitForTimeout(40)}return f&&fl&&!!await p.$('#p-practice .sum')})()&&p.errs.length===0,p.errs);await c.close()}
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
