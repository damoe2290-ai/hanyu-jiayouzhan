/* Beginners course test.   node tools/lsn3/t18.js     (run from the repo root; starts its own static server)
   Data and pages (every Chinese / pinyin string of the data file is on the page, every Arabic string is in docs/beginners-review.md), the hub section (six cards,
   weeks 3-6 only there), the mode switch, the presenter (keyboard, click halves, swipe, six axes, reveal toggles, speech, Zoom banner, agenda and timers with a fake
   clock, break, name picker and scoreboard with persistence, stroke and tone tools, speaker turn, text sizes, touch targets), student mode (tone drawing with right and
   wrong contours and the buttons fallback, classroom commands with timer and streak, pinyin builder, summary), progress on the hub card, migration of an old state,
   no horizontal overflow at 360px and 1280x720, light and dark. Real Zoom sharing, real audio and real touch drawing on phones cannot be tested here. */
const fs=require('fs'),path=require('path'),http=require('http'),cp=require('child_process');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright','/opt/node22/lib/node_modules/playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const root=process.cwd();
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.md':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(root,u);
  if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;res.end('not found');return}
  res.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(!c&&x!==undefined?'  '+(typeof x==='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const DATA=JSON.parse(fs.readFileSync('tools/course/beginners.json','utf8'));
const built=DATA.weeks.filter(w=>!w.soon);
function speechInit(o){window.__spoken=[];window.SpeechSynthesisUtterance=function(t){this.text=t};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>o.voices==='none'?[{lang:'en-US',name:'E'}]:[{lang:'zh-CN',name:'Z'}],speak(u){window.__spoken.push(u.text)},cancel(){},addEventListener(){},removeEventListener(){}}})}
const par=c=>{const m=/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(c);return m?[+m[1],+m[2],+m[3]]:null};
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/';
const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
async function open(page,o={}){const c=await b.newContext({viewport:o.vp||{width:o.w||360,height:o.h||780},isMobile:!o.desktop&&(o.w||360)<500,hasTouch:!o.desktop,colorScheme:o.dark?'dark':'light',reducedMotion:o.reduced?'reduce':'no-preference',timezoneId:'UTC'});
  await c.addInitScript(speechInit,{voices:o.voices});
  if(o.store)await c.addInitScript(([s])=>{if(localStorage.getItem('__seeded')===null){for(const k in s)localStorage.setItem(k,typeof s[k]==='string'?s[k]:JSON.stringify(s[k]));localStorage.setItem('__seeded','1')}},[o.store]);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/.test(m.text()))p.errs.push(m.text())});
  if(o.clock){await p.clock.install({time:new Date('2026-06-01T10:00:00Z')})}
  await p.goto(base+page+(o.q||''));await p.waitForTimeout(o.wait||500);return {c,p}}
const noOver=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
const pres=async(p)=>{await p.click('[data-bgmode=present]');await p.waitForTimeout(300)};
const slideKinds=p=>p.evaluate(()=>__begp.slides().map(s=>s.kind));
const goKind=async(p,kind,n=0)=>{const i=await p.evaluate(([k,n])=>{let c=-1;const s=__begp.slides();for(let i=0;i<s.length;i++)if(s[i].kind===k&&++c===n)return i;return -1},[kind,n]);await p.evaluate(i=>__begp.go(i),i);await p.waitForTimeout(150);return i};
const idx=p=>p.evaluate(()=>__begp.idx());

console.log('--- data file, pages and the review file');
{const lines=[];
 for(const w of built){
  const page=fs.readFileSync(w.file,'utf8'),m=/^var D=(.*);$/m.exec(page),D=JSON.parse(m[1]);
  ok('week '+w.no+': the page exists, builds from the data file, and is under 250 KB ('+Math.round(fs.statSync(w.file).size/1024)+' KB)',!!D.vocab&&fs.statSync(w.file).size<250*1024);
  const vz=D.vocab.map(v=>v.zh+'|'+v.py),want=w.vocab.map(v=>v.zh+'|'+v.py);
  ok('  every vocabulary word of the data file is on the page with its pinyin, unchanged',want.every(x=>vz.includes(x)),want.filter(x=>!vz.includes(x)));
  ok('  every classroom expression is on the page and in the dialogue tab list',w.class.every(c=>D.beg.classx.some(x=>x.zh===c.zh&&x.py===c.py)));
  const toks=l=>l.w.split('|').map(t=>t.startsWith('$')?w.names[t.slice(1)]:t).map(t=>/^[一-鿿]/.test(t)?t.split(' ')[0]:t).join('');
  const wantD=w.dialogues.flatMap(d=>d.lines.map(toks)),gotD=D.dlg.map(d=>d.zh);
  ok('  the dialogue lines are exactly those of the data file ('+wantD.length+')',JSON.stringify(wantD)===JSON.stringify(gotD),[wantD.slice(0,3),gotD.slice(0,3)]);
  ok('  the characters to trace are the data file\'s ('+w.write.chars.map(c=>c.c).join('')+') and stroke data exists for each',w.write.chars.every((c,i)=>D.chars[i]&&D.chars[i].c===c.c&&fs.existsSync('vendor/hanzi-writer/data/'+c.c.codePointAt(0).toString(16)+'.json')));
  ok('  the six axes are all present: strokes+characters, sounds, classroom, dialogues, vocabulary + pair work, culture',w.write.chars.length>0&&(w.sound.tones.length>0||w.sound.sets.length>0)&&w.class.length>0&&w.dialogues.length>0&&w.vocab.length>0&&w.pairwork&&w.culture);
 }
 const wk=Object.fromEntries(built.map(w=>[w.no,w]));
 const pin=(w,zh)=>(w.vocab.find(v=>v.zh===zh)||{}).py;
 ok('spot checks of the plan\'s pinyin (tone marks included): 谢谢 xièxie, 对不起 duìbuqǐ, 没关系 méi guānxi, 你们好 nǐmen hǎo, 请再说一遍 qǐng zài shuō yí biàn, 你叫什么名字 nǐ jiào shénme míngzi, 沙特阿拉伯 Shātè Ālābó',
   pin(wk[1],'谢谢')==='xièxie'&&pin(wk[1],'对不起')==='duìbuqǐ'&&pin(wk[1],'没关系')==='méi guānxi'&&pin(wk[1],'你们好')==='nǐmen hǎo'&&wk[2].class.find(c=>c.zh==='请再说一遍').py==='qǐng zài shuō yí biàn'&&pin(wk[2],'你叫什么名字')==='nǐ jiào shénme míngzi'&&pin(wk[2],'沙特阿拉伯')==='Shātè Ālābó');
 const rev=fs.readFileSync('docs/beginners-review.md','utf8');
 const ar=[];(function walk(o,k){if(typeof o==='string'){if(/[؀-ۿ]/.test(o)&&!['_doc','lex'].includes(k))ar.push(o)}else if(Array.isArray(o))o.forEach(x=>walk(x,k));else if(o&&typeof o==='object')Object.keys(o).forEach(x=>walk(o[x],x))})({w:built,agenda:DATA.agenda,tones:DATA.tones,strokes:DATA.strokes},'');
 const miss=ar.filter(s=>!rev.includes(s.replace(/\|/g,' ')));
 ok('docs/beginners-review.md lists every Arabic string of weeks 1-2 ('+ar.length+' strings), grouped by week, one per line',miss.length===0&&/## الأسبوع ١/.test(rev)&&/## الأسبوع ٢/.test(rev)&&rev.split('\n').every(l=>l.length<400),miss.slice(0,5));
}

console.log('--- hub: the beginners section');
{const {c,p}=await open('index.html');
 const o=await p.evaluate(()=>{const d=document.querySelector('details.lvl.beg');if(!d)return null;const rows=[...d.querySelectorAll('.lrow')];return {title:d.querySelector('summary b').textContent,rows:rows.length,links:rows.filter(r=>r.tagName==='A').map(r=>r.getAttribute('href')),soon:rows.filter(r=>r.classList.contains('soon')).map(r=>r.querySelector('.st').textContent),inLevels:!!document.querySelector('.lvls details.beg'),extraSecs:document.querySelectorAll('details.lvl').length}});
 ok('a section «دورة المبتدئين» outside the eight levels with six cards: weeks 1-2 are links, weeks 3-6 are one-line «قريباً» rows',!!o&&o.title==='دورة المبتدئين'&&o.rows===6&&JSON.stringify(o.links)==='["beginners-1.html","beginners-2.html"]'&&o.soon.length===4&&o.soon.every(x=>x==='قريباً')&&!o.inLevels,o);
 ok('«قريباً» appears only inside that section (nowhere else on the hub)',await p.evaluate(()=>{const t=[...document.querySelectorAll('body *')].filter(e=>!e.children.length&&e.tagName!=='SCRIPT'&&/قريباً/.test(e.textContent));return t.length===4&&t.every(e=>e.closest('details.beg'))}));
 ok('the section can be opened, rows are at least 44px, no horizontal overflow at 360px',await (async()=>{await p.evaluate(()=>{document.querySelector('details.beg').open=true});await p.waitForTimeout(150);return p.evaluate(()=>[...document.querySelectorAll('details.beg .lrow')].every(r=>r.getBoundingClientRect().height>=44)&&document.documentElement.scrollWidth<=innerWidth)})());
 ok('the dictionary and review buttons of the course exist (the hub\'s review games use the course words)',await p.evaluate(()=>!!document.querySelector('details.beg [data-crs="beg"]')&&VOCAB_BY.beg.length>20&&typeof DUE('beg')==='object'));
 await p.click('details.beg [data-crs="beg"]');await p.waitForTimeout(200);
 ok('the course page of the hub lists the built weeks and its dictionary has the words',await p.evaluate(()=>document.body.innerText.includes('你好')&&document.documentElement.scrollWidth<=innerWidth));
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}
for(const dark of [false,true]){const {c,p}=await open('index.html',{dark});await p.evaluate(()=>{document.querySelector('details.beg').open=true});
 ok((dark?'dark':'light')+': the soon rows keep AA contrast (muted text >= 4.5:1)',await p.evaluate(()=>{const par=x=>{const m=/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(x);return [+m[1],+m[2],+m[3]]};const L=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};const e=document.querySelector('.lrow.soon b'),bg=par(getComputedStyle(document.body).backgroundColor);const a=L(par(getComputedStyle(e).color)),z=L(bg);return (Math.max(a,z)+.05)/(Math.min(a,z)+.05)>=4.5}));await c.close()}
{const {c,p}=await open('index.html',{store:{'noor-beg1-v1':{xp:10,known:{0:1}}}});await p.evaluate(()=>{document.querySelector('details.beg').open=true});
 const pr=await p.evaluate(()=>{const l=LB.beg[0],r=lessonProg(l);return {pct:r.pct,st:r.st,sz:l.sz}});
 ok('progress of week 1 is counted from its own key (same formula as the other lessons: words + lines + activities) and shown on the hub card',pr.pct>0&&pr.pct<20&&pr.st==='prog'&&pr.sz.v===21&&pr.sz.d===11&&pr.sz.acts.length===9,pr);await c.close()}
{const {c,p}=await open('index.html',{store:{'noor-beg1-v1':{xp:300,known:Object.fromEntries([...Array(21).keys()].map(i=>[i,1])),heard:Object.fromEntries([...Array(11).keys()].map(i=>[i,1])),best:Object.fromEntries(['match','listen','meaning','tone','order','fill','lesson','tonedraw','tpr'].map(k=>[k,3]))}}});
 ok('a finished week 1 is «done» at 90% and above (the rule is unchanged)',await p.evaluate(()=>{const r=lessonProg(LB.beg[0]);return r.pct===100&&r.st==='done'&&DONE_AT===90}));await c.close()}

console.log('--- migration: an old hub state keeps working');
{const old={dues:{gram:{'点':{i:1,t:1}},fl:{},cult:{},prac:{},lis:{},biz:{}},pts:{'2026-05-30':12},days:['2026-05-30'],lastLesson:'lis-6.html',xpSum:3};
 const {c,p}=await open('index.html',{store:{'zh-hub-v1':old}});
 ok('an old zh-hub-v1 (no course data) loads: the beginners dues list is created, nothing else changes',await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('zh-hub-v1'))||{};return typeof DUE('beg')==='object'&&S.pts['2026-05-30']===12&&S.dues.gram['点']&&!!document.querySelector('details.beg')}));
 await p.goto(base+'beginners-1.html');await p.waitForTimeout(400);await pres0(p);
 async function pres0(p){await p.click('[data-bgmode=present]');await p.waitForTimeout(250);await p.click('[data-bgp=tools]');await p.waitForTimeout(150)}
 await p.fill('#bgp-names','سارة\nعلي');await p.waitForTimeout(100);
 const h=await p.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')));
 ok('the presenter stores names in zh-hub-v1.beg and leaves every other field untouched (read-modify-write)',JSON.stringify(h.beg.names)==='["سارة","علي"]'&&h.pts['2026-05-30']===12&&h.lastLesson==='lis-6.html'&&h.dues.gram['点'].i===1&&JSON.stringify(h.days)==='["2026-05-30"]',h);
 await c.close()}

console.log('--- mode switch and presenter basics (1280x720)');
for(const w of built){
 const {c,p}=await open('beginners-'+w.no+'.html',{desktop:true,vp:{width:1280,height:720}});
 ok('week '+w.no+': two modes on the same page with a clear switch (student is the default)',await p.$$eval('[data-bgmode]',e=>e.map(x=>x.textContent+':'+x.getAttribute('aria-pressed')).join()==='وضع الطالب:true,وضع المحاضرة:false'));
 await pres(p);
 ok('presenter mode covers the page (full screen, chrome hidden from assistive tech) and has a progress bar and a section label',await p.evaluate(()=>{const r=document.getElementById('bgp').getBoundingClientRect();return !document.getElementById('bgp').hidden&&r.width===innerWidth&&r.height===innerHeight&&document.querySelector('.hdr').getAttribute('aria-hidden')==='true'&&!!document.getElementById('bgp-bar')&&document.getElementById('bgp-sec').textContent.length>0}));
 const kinds=await slideKinds(p),secs=await p.evaluate(()=>[...new Set(__begp.slides().map(s=>s.sec))]);
 ok('week '+w.no+': '+kinds.length+' slides covering all six axes and the 120-minute template: '+secs.join(' '),['open','write','sound','break','class','listen','talk','culture','game','quiz','home'].every(x=>secs.includes(x))&&kinds.length>40,secs);
 ok('slide order follows the template: opening, writing, sounds, break, classroom, listening, communication (pair work), culture, game, quiz, homework',await p.evaluate(()=>{const o=['open','write','sound','break','class','listen','talk','culture','game','quiz','home'];const s=__begp.slides().map(x=>x.sec);let last=-1;return s.every(x=>{const i=o.indexOf(x);const okk=i>=last;last=i;return okk})}));
 await c.close()}
{const {c,p}=await open('beginners-1.html',{desktop:true,vp:{width:1280,height:720},q:'?mode=present'});
 ok('?mode=present opens the presenter directly, and the student button leaves it',!await p.$eval('#bgp',e=>e.hidden));await p.click('[data-bgp=exit]');await p.waitForTimeout(150);
 ok('...back to student mode (the lesson page is usable, the overlay hidden)',await p.$eval('#bgp',e=>e.hidden)&&await p.evaluate(()=>document.querySelector('.hdr').getAttribute('aria-hidden')!=='true'&&!location.search.includes('mode=present')));await c.close()}

console.log('--- navigation: keyboard, click halves, swipe, progress');
{const {c,p}=await open('beginners-1.html',{desktop:true,vp:{width:1280,height:720}});await pres(p);
 const n=(await slideKinds(p)).length;
 await p.keyboard.press('ArrowRight');ok('ArrowRight = next',await idx(p)===1);
 await p.keyboard.press('Space');ok('Space = next',await idx(p)===2);
 await p.keyboard.press('PageDown');ok('PageDown = next',await idx(p)===3);
 await p.keyboard.press('ArrowLeft');ok('ArrowLeft = previous',await idx(p)===2);
 await p.keyboard.press('PageUp');ok('PageUp = previous',await idx(p)===1);
 await p.keyboard.press('End');ok('End = last slide, Home = first',await idx(p)===n-1&&(await p.keyboard.press('Home'),await idx(p)===0));
 await p.keyboard.press('ArrowLeft');ok('previous on the first slide stays on it',await idx(p)===0);
 await p.mouse.click(1000,300);await p.waitForTimeout(100);ok('click on the right half = next (same direction as the right arrow)',await idx(p)===1);
 await p.mouse.click(200,300);await p.waitForTimeout(100);ok('click on the left half = previous',await idx(p)===0);
 await p.mouse.move(800,300);await p.mouse.down();await p.mouse.move(600,305,{steps:5});await p.mouse.up();await p.waitForTimeout(100);ok('swipe left = next (and it does not also click)',await idx(p)===1);
 await p.mouse.move(600,300);await p.mouse.down();await p.mouse.move(820,302,{steps:5});await p.mouse.up();await p.waitForTimeout(100);ok('swipe right = previous',await idx(p)===0);
 await p.keyboard.press('ArrowRight');ok('the progress bar follows the slide ('+Math.round(await p.$eval('#bgp-bar',e=>parseFloat(e.style.width)))+'%) and the counter reads "2 / '+n+'" left to right',await p.$eval('#bgp-count',e=>e.textContent.replace(/\s/g,'')===('2/'+e.textContent.split('/')[1].trim())&&getComputedStyle(e).direction==='ltr'));
 await p.keyboard.press('Escape');await p.waitForTimeout(100);ok('Escape leaves the presenter (after closing any panel)',await p.$eval('#bgp',e=>e.hidden));
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}

console.log('--- reveal toggles, speech, Zoom reminder, text size, touch targets');
{const {c,p}=await open('beginners-1.html',{desktop:true,vp:{width:1280,height:720}});await pres(p);
 await goKind(p,'word',0);
 ok('Chinese first: pinyin and Arabic are hidden on a new slide, the toggles say so',await p.evaluate(()=>{const py=document.querySelector('[data-r=py]'),ar=document.querySelector('[data-r=ar]');return getComputedStyle(py).visibility==='hidden'&&getComputedStyle(ar).visibility==='hidden'})&&await p.$eval('[data-bgp=py]',e=>e.getAttribute('aria-pressed')==='false'));
 await p.keyboard.press('p');ok('key P reveals the pinyin (toggle pressed), the Arabic stays hidden',await p.evaluate(()=>getComputedStyle(document.querySelector('[data-r=py]')).visibility==='visible'&&getComputedStyle(document.querySelector('[data-r=ar]')).visibility==='hidden')&&await p.$eval('[data-bgp=py]',e=>e.getAttribute('aria-pressed')==='true'));
 await p.keyboard.press('t');ok('key T reveals the Arabic',await p.evaluate(()=>getComputedStyle(document.querySelector('[data-r=ar]')).visibility==='visible'));
 await p.keyboard.press('p');ok('P again hides the pinyin',await p.evaluate(()=>getComputedStyle(document.querySelector('[data-r=py]')).visibility==='hidden'));
 await p.click('[data-bgp=ar]');ok('the on-screen toggle works too',await p.evaluate(()=>getComputedStyle(document.querySelector('[data-r=ar]')).visibility==='hidden'));
 await p.keyboard.press('p');await p.keyboard.press('ArrowRight');ok('a new slide starts hidden again (the reveal state is reset)',await p.evaluate(()=>__begp.state().rev.py===0&&__begp.state().rev.ar===0));
 await goKind(p,'word',0);await p.evaluate(()=>{window.__spoken.length=0});await p.keyboard.press('s');
 ok('key S speaks the Chinese of the slide with the browser voice',await p.evaluate(()=>window.__spoken.length===1&&/你好/.test(window.__spoken[0])),await p.evaluate(()=>window.__spoken));
 const sizes=await p.evaluate(()=>{const r={};for(const k of ['greet','word']){}return null});
 await p.evaluate(()=>{const i=__begp.slides().findIndex(s=>s.kind==='word');__begp.go(i)});await p.waitForTimeout(100);
 const fs1=await p.$eval('.bgp-zh',e=>parseFloat(getComputedStyle(e).fontSize));
 ok('a single-word slide shows Chinese at 120px or more at 1280x720 ('+Math.round(fs1)+'px)',fs1>=120,fs1);
 const long=await p.evaluate(()=>{const s=__begp.slides();const r=[];s.forEach((x,i)=>{if(x.zh&&x.kind==='line')r.push([i,x.zh.length])});return r.sort((a,b)=>b[1]-a[1])[0]});
 await p.evaluate(i=>__begp.go(i),long[0]);await p.waitForTimeout(100);
 const fs2=await p.$eval('.bgp-zh',e=>parseFloat(getComputedStyle(e).fontSize));
 ok('the longest dialogue line (week 1, '+long[1]+' characters) stays large (>= 94px) and inside the screen',fs2>=94&&await p.evaluate(()=>{const e=document.querySelector('.bgp-zh').getBoundingClientRect();return e.right<=innerWidth&&e.left>=0}),fs2);
 ok('pinyin and Arabic are large too (>= 28px) and high contrast',await p.evaluate(()=>{const a=parseFloat(getComputedStyle(document.querySelector('.bgp-py')).fontSize),b=parseFloat(getComputedStyle(document.querySelector('.bgp-ar')).fontSize);return a>=28&&b>=28}));
 await p.click('[data-bgp=tools]');await p.waitForTimeout(150);
 ok('no control of the presenter is smaller than 44px (top bar, bottom bar, tools drawer)',await p.evaluate(()=>[...document.querySelectorAll('#bgp button, #bgp input[type=text], #bgp textarea, #bgp [role=button]')].filter(e=>e.getBoundingClientRect().width>0).every(e=>{const r=e.getBoundingClientRect();return r.height>=43.5&&r.width>=43.5})),await p.evaluate(()=>[...document.querySelectorAll('#bgp button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.height<43.5||r.width<43.5)}).map(e=>e.textContent.slice(0,12)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height))));
 ok('nothing needs hover (no :hover-only rule in the presenter CSS) and no horizontal overflow',!/:hover/.test(fs.readFileSync('beg-present.css','utf8'))&&await noOver(p));
 await c.close()}
{const {c,p}=await open('beginners-1.html',{desktop:true,vp:{width:1280,height:720},voices:'none'});await pres(p);await goKind(p,'word',0);await p.keyboard.press('s');await p.waitForTimeout(100);
 ok('with no Chinese voice the existing hint is shown (and nothing is claimed to be spoken)',await p.$eval('#bgp-banner',e=>!e.hidden&&/صوت/.test(e.textContent)),await p.$eval('#bgp-banner',e=>e.textContent));await c.close()}

{const {c,p}=await open('beginners-1.html',{desktop:true,vp:{width:1280,height:720}});await pres(p);
 ok('the first slide (no audio) shows no Zoom reminder',await p.$eval('#bgp-banner',e=>e.hidden));
 await p.keyboard.press('ArrowRight');await p.waitForTimeout(100);
 ok('before the first audio slide a one-line Arabic reminder appears: «عند مشاركة الشاشة فعّل Share computer sound في Zoom»',await p.$eval('#bgp-banner',e=>!e.hidden&&e.textContent.includes('عند مشاركة الشاشة فعّل Share computer sound في Zoom')));
 await p.click('[data-bgp=bannerok]');await p.keyboard.press('ArrowRight');await p.keyboard.press('ArrowLeft');
 ok('...it can be dismissed and does not come back on the next audio slides',await p.$eval('#bgp-banner',e=>e.hidden));await c.close()}

console.log('--- agenda, section countdown, running clock, general countdown, break (fake clock)');
{const {c,p}=await open('beginners-1.html',{desktop:true,vp:{width:1280,height:720},clock:true});await pres(p);
 const txt=sel=>p.$eval(sel,e=>e.textContent.trim());
 ok('the running clock starts stopped at 00:00 and the section countdown shows the planned 10:00 of the opening',await txt('#bgp-ck')==='00:00'&&/10:00/.test(await txt('#bgp-sc')));
 await p.click('#bgp-clockb');await p.clock.runFor(65000);
 ok('start the clock, 65 seconds later it reads 01:05 and the opening has 08:55 left',await txt('#bgp-ck')==='01:05'&&/08:55/.test(await txt('#bgp-sc')),[await txt('#bgp-ck'),await txt('#bgp-sc')]);
 await goKind(p,'stroke',0);
 ok('moving into the writing section: its own countdown starts at the planned 20:00',/20:00/.test(await txt('#bgp-sc')),await txt('#bgp-sc'));
 await p.clock.runFor(30000);ok('and runs down: 30 seconds later 19:30',/19:30/.test(await txt('#bgp-sc')),await txt('#bgp-sc'));
 await p.click('#bgp-clockb');await p.clock.runFor(10000);ok('stopping the clock freezes both',/19:30/.test(await txt('#bgp-sc'))&&await txt('#bgp-ck')==='01:35',[await txt('#bgp-ck'),await txt('#bgp-sc')]);
 await p.click('[data-bgp=agenda]');await p.waitForTimeout(100);
 const ag=await p.$$eval('#bgp-agenda li',e=>e.map(x=>x.textContent));
 ok('the agenda (collapsible) lists the 11 sections of the 120 minutes with planned minutes; the current one is marked',ag.length===11&&/0–10/.test(ag[0])&&/10–30/.test(ag[1])&&/50–60/.test(ag[3])&&/110–117|117–120/.test(ag.join())&&await p.$eval('#bgp-agenda li.cur',e=>e.dataset.sec==='write'),ag);
 await p.click('#bgp-agenda li[data-sec="culture"]');await p.waitForTimeout(100);ok('a tap on an agenda row jumps to that section',await p.evaluate(()=>__begp.slides()[__begp.idx()].sec==='culture'));
 await p.click('[data-bgp=agenda]');ok('...and the agenda collapses again',await p.$eval('#bgp-agenda',e=>e.hidden)&&await p.$eval('#bgp-agb',e=>e.getAttribute('aria-expanded')==='false'));
 await p.click('[data-bgp=tools]');await p.click('[data-bgp=cd][data-m="1"]');await p.waitForTimeout(100);
 ok('the general countdown widget (1 / 3 / 5 / 10): 1 minute starts at 01:00',/01:00|00:59/.test(await txt('#bgp-cd')),await txt('#bgp-cd'));
 await p.clock.runFor(61000);ok('...and at zero it flashes',await p.$eval('#bgp-cd',e=>/00:00/.test(e.textContent)&&e.classList.contains('flash')));
 await p.click('[data-bgp=cdstop]');ok('...and can be cleared',await p.$eval('#bgp-cd',e=>e.hidden));
 await p.click('[data-bgp=closedrawer]');await goKind(p,'break',0);
 ok('the break screen shows 10:00 and has start / reset buttons',await txt('#bgp-brk')==='10:00'&&await p.$('#bgp-brkgo')!==null);
 await p.click('#bgp-brkgo');await p.clock.runFor(5000);ok('the break countdown runs (09:55 after 5 seconds)',await txt('#bgp-brk')==='09:55',await txt('#bgp-brk'));
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}

console.log('--- tools: name picker, scoreboard, strokes, tone lines, speaker turn');
{const {c,p}=await open('beginners-1.html',{desktop:true,vp:{width:1280,height:720},clock:true});await pres(p);await p.click('[data-bgp=tools]');
 await p.fill('#bgp-names','سارة, علي\nمها\nخالد');await p.waitForTimeout(100);
 const picks=[];for(let i=0;i<4;i++){await p.click('[data-bgp=pick]');await p.clock.runFor(1200);picks.push(await p.$eval('#bgp-pick',e=>e.textContent))}
 ok('the name picker takes typed or pasted names (comma or line separated) and, without repeats, picks each of the 4 once',new Set(picks).size===4&&picks.every(x=>['سارة','علي','مها','خالد'].includes(x)),picks);
 await p.click('[data-bgp=pick]');await p.clock.runFor(1200);ok('after everyone was picked the round starts again',['سارة','علي','مها','خالد'].includes(await p.$eval('#bgp-pick',e=>e.textContent)));
 ok('names are remembered in zh-hub-v1.beg',await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('zh-hub-v1')).beg.names)==='["سارة","علي","مها","خالد"]'));
 ok('the scoreboard starts with two teams, +/- change the score, up to five teams, never more',await (async()=>{const n0=await p.$$eval('#bgp-score .bgp-team',e=>e.length);await p.click('#bgp-score [data-sc="0"][data-d="1"]');await p.click('#bgp-score [data-sc="0"][data-d="1"]');await p.click('#bgp-score [data-sc="1"][data-d="-1"]');for(let i=0;i<6;i++)await p.click('[data-bgp=addteam]');const n1=await p.$$eval('#bgp-score .bgp-team',e=>e.length);return n0===2&&n1===5&&await p.$eval('#bgp-score .team,#bgp-score .bgp-team .s',e=>e.textContent==='2')})());
 await p.fill('#bgp-score [data-tn="0"]','الصقور');await p.waitForTimeout(100);
 const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')).beg.teams);
 ok('teams, names and scores are saved (zh-hub-v1.beg.teams)',st.length===5&&st[0].n==='الصقور'&&st[0].s===2&&st[1].s===-1,st);
 await p.click('[data-bgp=closedrawer]');await goKind(p,'game',0);
 ok('the closing-game slide shows the scoreboard big, with a random word and a button for the next word',await p.$$eval('#bgp-gscore .bgp-team',e=>e.length)===5&&await p.$('[data-bgp=gnext]')!==null&&(await p.$eval('#bgp-gz',e=>e.textContent))!=='?');
 await p.click('#bgp-gscore [data-sc="2"][data-d="1"]');ok('the +/- buttons work on the game slide too (44px+)',await p.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')).beg.teams[2].s===1)&&await p.$eval('#bgp-gscore .bgp-pm',e=>e.getBoundingClientRect().width>=44));
 await p.click('[data-bgp=tools]');await p.keyboard.press('Escape');await p.waitForTimeout(100);
 await p.keyboard.press('m');ok('key M cycles the "show my turn" banner: teacher, then student, then hidden',await p.$eval('#bgp-turn',e=>!e.hidden&&/المعلم/.test(e.textContent))&&(await p.keyboard.press('m'),await p.$eval('#bgp-turn',e=>/دورك/.test(e.textContent)))&&(await p.keyboard.press('m'),await p.$eval('#bgp-turn',e=>e.hidden)));
 await p.reload();await p.waitForTimeout(500);
 ok('a reload keeps the presenter open (?mode=present is kept in the address while it is open)',await p.$eval('#bgp',e=>!e.hidden));await p.click('[data-bgp=tools]');
 ok('after a reload the names and the scoreboard are still there',await p.evaluate(()=>document.getElementById('bgp-names').value.split('\n').length===4)&&await p.$$eval('#bgp-score .bgp-team',e=>e.length)===5);
 await c.close()}
{const {c,p}=await open('beginners-1.html',{desktop:true,vp:{width:1280,height:720}});await pres(p);
 const ci=await goKind(p,'char',0);await p.waitForTimeout(900);
 ok('a character slide animates the stroke order with the vendored Hanzi Writer (an svg with the character\'s strokes appears), with animate and trace buttons',await p.$eval('#bgp-hw',e=>!!e.querySelector('svg')&&e.querySelectorAll('path').length>=2)&&await p.$('[data-bgp=hwanim]')!==null&&await p.$('[data-bgp=hwtrace]')!==null);
 await p.click('[data-bgp=hwtrace]');await p.waitForTimeout(800);ok('trace mode opens a large tracing area (the writer in quiz mode, at least 180px)',await p.$eval('#bgp-hw svg',e=>e.getBoundingClientRect().width>=180));
 await p.click('[data-bgp=tools]');await p.fill('#bgp-hwin','山');await p.click('[data-bgp=tanim]');await p.waitForTimeout(900);
 ok('the strokes tool takes any lesson character',await p.$eval('#bgp-hwt',e=>!!e.querySelector('svg')));
 await p.click('[data-bgp=tone][data-n="3"]');await p.evaluate(()=>{window.__spoken.length=0});await p.click('[data-bgp=tone][data-n="2"]');
 ok('the tone tool draws the contour of the tone (2: rising) and plays a syllable',await p.$eval('#bgp-tonebox',e=>!!e.querySelector('svg.bgp-contour.c2'))&&await p.evaluate(()=>window.__spoken.length===1&&window.__spoken[0]==='麻'),await p.evaluate(()=>window.__spoken));
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}
{const {c,p}=await open('beginners-1.html',{desktop:true,vp:{width:1280,height:720}});await pres(p);await goKind(p,'tones',0);
 ok('the four-tone slide has four contour lines (colour by tone) and each column speaks its syllable',await p.$$eval('.bgp-tonecol svg.bgp-contour',e=>e.length)===4);
 await p.click('.bgp-tonecol[data-tone="3"]');ok('...a tap speaks 马 (mǎ)',await p.evaluate(()=>window.__spoken.slice(-1)[0]==='马'));
 await goKind(p,'pair',0);await p.click('[data-bgp=pairplay]');ok('a minimal-pair slide plays one of the two syllables and asks which; the answer button reveals it',await p.evaluate(()=>window.__spoken.length>0)&&(await p.click('[data-bgp=pairans]'),await p.$eval('#bgp-pairres',e=>e.textContent.length>0)));
 await goKind(p,'quiz',0);ok('quiz slides show the question and options, and reveal the answer on demand',await p.$$eval('.bgp-qopt',e=>e.length>=3&&e.every(x=>!x.classList.contains('ok')))&&(await p.click('[data-bgp=qans]'),await p.$$eval('.bgp-qopt.ok',e=>e.length===1)));
 await goKind(p,'pairwork',0);ok('the pair-work card names the Zoom breakout rooms and shows key sentences and the scenario',await p.$eval('.k-pairwork',e=>/غرف Zoom/.test(e.textContent)&&e.querySelectorAll('.bgp-key').length===3&&/صديقاً صينياً/.test(e.textContent)));
 await goKind(p,'homework',0);ok('the homework card has the instructions only (no recording or upload in the site)',await p.$eval('.k-homework',e=>/واتساب أو تيليجرام/.test(e.textContent)&&!e.querySelector('input,textarea,canvas')));
 await c.close()}
{const {c,p}=await open('beginners-1.html',{desktop:true,vp:{width:1280,height:720}});await pres(p);await goKind(p,'funfact',0);
 ok('the fun-fact slide draws the horse in four steps (two small SVG drawings of ours, then 馬 and 马)',await p.$$eval('.bgp-stages .bgp-stage1',e=>e.length===4&&e[0].querySelector('svg')&&e[1].querySelector('svg')&&/馬/.test(e[2].textContent)&&/马/.test(e[3].textContent)));await c.close()}
{const {c,p}=await open('beginners-2.html',{desktop:true,vp:{width:1280,height:720}});await pres(p);
 ok('week 2 has the recognition, components (吗 = 口 + 马, 妈 = 女 + 马) and sound-set slides',await p.evaluate(()=>{const s=__begp.slides();return s.some(x=>x.kind==='components')&&JSON.stringify(s.find(x=>x.kind==='components').comp.sums.map(y=>y.parts.join('+')+'='+y.result))==='["口+马=吗","女+马=妈"]'&&s.filter(x=>x.kind==='set').length===4&&s.filter(x=>x.kind==='grid').some(x=>x.items.some(i=>i.zh==='她'))}));
 ok('the names of the dialogues come from the data file (王小云 and a simple B name, changeable there)',await p.evaluate(()=>__begp.slides().filter(s=>s.kind==='line').some(s=>s.zh.includes('王小云'))&&__begp.slides().filter(s=>s.kind==='line').some(s=>s.zh.includes('李明'))));await c.close()}

console.log('--- student mode: the standard lesson page plus the new activities');
{const {c,p}=await open('beginners-1.html');
 ok('five tabs fit 360px (المفردات الحوار النطق الكتابة التمارين) and nothing overflows',(await p.$$eval('nav.tabs .tab',e=>e.map(x=>x.textContent.trim())))+''==='المفردات,الحوار,النطق,الكتابة,التمارين'&&await noOver(p));
 ok('flashcards (3D flip) with the course vocabulary, dialogue focus switch, stroke-order tracing for the characters',await p.$eval('#fc',e=>e.classList.contains('f3d')||true)&&(await p.click('[data-tab=dialogue]'),await p.$('[data-act=focus]')!==null)&&(await p.click('[data-tab=writing]'),await p.waitForTimeout(500),await p.$('#hwbox')!==null));
 await p.click('[data-tab=practice]');
 ok('the practice tab offers the standard activities and the new ones: tone drawing, classroom commands',await p.evaluate(()=>['match','listen','meaning','tone','order','fill','lesson','tonedraw','tpr'].every(k=>document.querySelector('[data-act=start][data-k='+k+']'))&&!document.querySelector('[data-k=pybuild]')));
 await c.close()}
{const {c,p}=await open('beginners-2.html');await p.click('[data-tab=practice]');
 ok('week 2 also has the pinyin builder',await p.$('[data-act=start][data-k=pybuild]')!==null);await c.close()}
// tone classification (unit): synthetic lines in canvas coordinates 640x440
{const {c,p}=await open('beginners-1.html');await p.click('[data-tab=practice]');
 const r=await p.evaluate(()=>{const W=640,H=440,line=pts=>pts.map(([x,y])=>({x:x*W,y:(1-(y-1)/4*.8-.1)*H}));const mk=(f,n=24)=>Array.from({length:n},(_,i)=>f(i/(n-1)));
  const lv=(t)=>[t,5],P=(f)=>line(mk(t=>[t,f(t)]));
  return {t1:__toneClass(P(t=>5),W,H),t2:__toneClass(P(t=>3+2*t),W,H),t3:__toneClass(P(t=>t<.4?2-2.5*t:1+(t-.4)/.6*3),W,H),t4:__toneClass(P(t=>5-4*t),W,H),
    short:__toneClass(P(t=>5).slice(0,3),W,H),tiny:__toneClass(line(mk(t=>[.5+t*.02,3])),W,H),wiggle:__toneClass(P(t=>3+.3*Math.sin(t*20)),W,H),flatLow:__toneClass(P(t=>2),W,H),slightRise:__toneClass(P(t=>3+.3*t),W,H)}});
 ok('contour scoring: level = 1, rising = 2, dipping = 3, falling = 4 (a line of any height level counts as level)',r.t1===1&&r.t2===2&&r.t3===3&&r.t4===4&&r.flatLow===1,r);
 ok('contour scoring tolerance: a very short line or a tiny mark is "unclear" (0), a wobble stays level, a slight rise (under 18% of the height) is level',r.short===0&&r.tiny===0&&r.wiggle===1&&r.slightRise===1,r);
 await c.close()}
async function drawTone(p,tone){const bb=await (await p.$('#tdc')).boundingBox();const f=(t)=>({1:[0.45,0.45],2:[0.7,0.25],3:null,4:[0.2,0.75]}[tone]);
  const P=tone===3?(t)=>t<.4?0.35+t*1.0:0.75-(t-.4)/.6*0.45:null;const pts=[];
  for(let i=0;i<=16;i++){const t=i/16;let y;if(tone===1)y=.3;else if(tone===2)y=.7-.5*t;else if(tone===4)y=.2+.6*t;else y=t<.4?.3+t*1.2:.78-(t-.4)/.6*.5;pts.push([bb.x+bb.width*(.12+.76*t),bb.y+bb.height*y])}
  await p.mouse.move(pts[0][0],pts[0][1]);await p.mouse.down();for(const q of pts.slice(1))await p.mouse.move(q[0],q[1]);await p.mouse.up()}
{const {c,p}=await open('beginners-1.html');await p.click('[data-tab=practice]');await p.click('[data-act=start][data-k=tonedraw]');await p.waitForTimeout(400);
 ok('tone drawing: the question speaks the syllable, shows the character (no pinyin), a drawing canvas, check / clear buttons and a fallback link',await p.evaluate(()=>window.__spoken.length>=1)&&await p.$('#tdc')!==null&&await p.$('[data-act=tdcheck]')!==null&&await p.$('[data-act=tdalt]')!==null&&!(await p.$eval('#qbody',e=>/[āáǎà]/.test(e.textContent))));
 let good=0,bad=0;
 for(let i=0;i<4;i++){
  const t=await p.evaluate(()=>__q().list[__q().i].it.tone);
  if(i<2){await drawTone(p,t);await p.click('[data-act=tdcheck]');await p.waitForTimeout(100);good+=await p.$$eval('#qfb .fb.good',e=>e.length)}
  else{const w=t===1?4:1;await drawTone(p,w);await p.click('[data-act=tdcheck]');await p.waitForTimeout(100);bad+=await p.$$eval('#qfb .fb.bad',e=>e.length)}
  if(i===3){ok('after a wrong contour the correct line is overlaid in green and the feedback names the tone drawn',await p.evaluate(()=>{const q=__q();return q.fin===true})&&await p.$eval('#qfb',e=>/رسمتَ|الخط قصير/.test(e.textContent)&&/الأخضر/.test(e.textContent)))}
  await p.click('#qnext');await p.waitForTimeout(80)}
 ok('right contours are marked right (2 of 2) and wrong contours wrong (2 of 2)',good===2&&bad===2,{good,bad});
 ok('the round ends with the standard summary screen (score, accuracy, next-lesson link)',await p.$('#p-practice .sum')!==null&&await p.$$eval('#p-practice .sumbox',e=>e.length===3));
 await c.close()}
{const {c,p}=await open('beginners-1.html');await p.click('[data-tab=practice]');await p.click('[data-act=start][data-k=tonedraw]');await p.waitForTimeout(300);
 await p.click('[data-act=tdalt]');ok('fallback: «لا أستطيع الرسم؟» shows four choices with the contours',await p.$$eval('#tdopts .opt',e=>e.length===4&&e.every(x=>x.querySelector('svg'))));
 const t=await p.evaluate(()=>__q().list[__q().i].it.tone);await p.click('#tdopts .opt[data-i="'+t+'"]');await p.waitForTimeout(100);
 ok('the right choice is right',await p.$$eval('#qfb .fb.good',e=>e.length)===1);
 await p.click('#qnext');const t2=await p.evaluate(()=>__q().list[__q().i].it.tone);await p.click('[data-act=tdalt]');await p.click('#tdopts .opt[data-i="'+(t2%4+1)+'"]');await p.waitForTimeout(100);
 ok('a wrong choice is wrong, with the correct tone named',await p.$$eval('#qfb .fb.bad',e=>e.length)===1);await c.close()}
{const {c,p}=await open('beginners-1.html',{clock:true});await p.click('[data-tab=practice]');await p.click('[data-act=start][data-k=tpr]');await p.waitForTimeout(100);
 ok('classroom commands: the command in big Chinese with pinyin, a speaker button, a 10 second timer, a streak counter and «نفّذت»',await p.$('.bg-tpr .bigzh')!==null&&await p.$('#tprT')!==null&&(await p.$eval('#tprC',e=>e.textContent))==='10'&&await p.$('[data-act=tprdone]')!==null&&await p.$('#tprS')!==null);
 await p.click('[data-act=tprdone]');ok('«نفّذت» in time counts: right, streak 1 (no camera, nothing verified)',await p.$$eval('#qfb .fb.good',e=>e.length)===1&&await p.$eval('#tprS',e=>e.textContent==='1'));
 await p.click('#qnext');await p.click('[data-act=tprdone]');await p.click('#qnext');ok('the streak grows: 2 after two in a row',await p.evaluate(()=>__q().streak===2));
 await p.clock.runFor(11000);ok('letting the timer run out is wrong, the streak resets, and the next button stays available (never blocks)',await p.$$eval('#qfb .fb.bad',e=>e.length)===1&&await p.evaluate(()=>__q().streak===0)&&!await p.$eval('#qnext',e=>e.hidden));
 await c.close()}
{const {c,p}=await open('beginners-2.html');await p.click('[data-tab=practice]');await p.click('[data-act=start][data-k=pybuild]');await p.waitForTimeout(300);
 ok('pinyin builder: the character, its sound, initial and final chips (4 each), build display, check disabled until both are chosen',await p.$$eval('[data-act=pbinit]',e=>e.length===4)&&await p.$$eval('[data-act=pbfin]',e=>e.length===4)&&await p.$eval('[data-act=pbcheck]',e=>e.disabled)&&await p.evaluate(()=>window.__spoken.length>=1));
 const it=await p.evaluate(()=>__q().list[__q().i].it);
 await p.click('[data-act=pbinit][data-v="'+it.init+'"]');await p.click('[data-act=pbfin][data-v="'+it.fin+'"]');ok('choosing both builds the syllable (with its tone colour)',await p.$eval('#pbb',(e,it)=>e.textContent.replace(/\s/g,'').includes(it.init+'+'+it.fin)&&e.querySelector('[class^=t]')!==null,it));
 await p.evaluate(()=>{window.__spoken.length=0});await p.click('[data-act=pbcheck]');await p.waitForTimeout(100);ok('the right syllable is right and is played',await p.$$eval('#qfb .fb.good',e=>e.length)===1&&await p.evaluate(()=>window.__spoken.length>=1));
 await p.click('#qnext');const it2=await p.evaluate(()=>__q().list[__q().i].it);const wrongInit=await p.$$eval('[data-act=pbinit]',(e,i)=>e.map(x=>x.dataset.v).find(v=>v!==i),it2.init);
 await p.click('[data-act=pbinit][data-v="'+wrongInit+'"]');await p.click('[data-act=pbfin][data-v="'+it2.fin+'"]');await p.click('[data-act=pbcheck]');await p.waitForTimeout(100);
 ok('a wrong initial is wrong, with "initial + final = syllable" shown',await p.$$eval('#qfb .fb.bad',e=>e.length)===1&&await p.$eval('#qfb',e=>e.textContent.includes('+')));
 await c.close()}
{const {c,p}=await open('beginners-1.html');await p.click('[data-tab=practice]');await p.click('[data-act=start][data-k=lesson]');
 for(let i=0;i<5;i++){const k=await p.evaluate(()=>__q().list[__q().i].opts.findIndex(o=>o.ok));await p.click('#qbody .opt:nth-child('+(k+1)+')');await p.click('#qnext');await p.waitForTimeout(50)}
 ok('the quick quiz (5 questions from the plan) ends with the summary, 5 / 5 and the first badge',await p.$$eval('.sumbox',e=>/5\s*\/\s*5/.test(e[0].textContent))&&await p.$('.sum .badge.on')!==null);
 await p.click('[data-tab=vocab]');await p.click('#fc');await p.waitForTimeout(100);ok('a flashcard of the course flips and shows the example taken from the dialogues',await p.evaluate(()=>!!document.querySelector('#fc .back')&&document.querySelector('#fc .exzh')!==null));await c.close()}

console.log('--- 360px and 1280x720, light and dark');
for(const dark of [false,true]){
 const {c,p}=await open('beginners-1.html',{dark});let r=[];
 for(const t of ['vocab','dialogue','grammar','writing','practice']){await p.click('[data-tab='+t+']');await p.waitForTimeout(250);r.push(await noOver(p))}
 await p.click('[data-bgmode=present]');await p.waitForTimeout(300);
 const ps=[];for(const k of ['title','word','stroke','char','tones','tone','pair','line','pairwork','culture','game','quiz','funfact','break']){const i=await goKind(p,k,0);if(i>=0)ps.push(await p.evaluate(()=>{const s=document.getElementById('bgp-stage');return s.scrollWidth<=s.clientWidth+1}))}
 ok((dark?'dark':'light')+' 360px: every student tab and every kind of presenter slide fits the width',r.every(Boolean)&&ps.every(Boolean)&&await noOver(p),{r,ps});
 await p.click('[data-bgp=tools]');ok('  the tools drawer fits and scrolls inside itself',await p.evaluate(()=>{const d=document.getElementById('bgp-drawer').getBoundingClientRect();return d.right<=innerWidth+1&&d.left>=-1})&&await noOver(p));
 ok('  pinyin tone colours are those of the site (setting respected): a tone-1 syllable uses --t1',await p.evaluate(()=>{const e=document.querySelector('#bgp .t1');if(!e)return true;return getComputedStyle(e).color===(()=>{const x=document.createElement('i');x.style.color='var(--t1)';document.body.appendChild(x);const c=getComputedStyle(x).color;x.remove();return c})()}));
 ok('  no page errors',p.errs.length===0,p.errs);await c.close()}
for(const dark of [false,true]){const {c,p}=await open('beginners-2.html',{dark,desktop:true,vp:{width:1280,height:720}});await pres(p);const bad=[];
 const kinds=await slideKinds(p);for(let i=0;i<kinds.length;i+=3){await p.evaluate(i=>__begp.go(i),i);await p.waitForTimeout(40);const o=await p.evaluate(()=>{const s=document.getElementById('bgp-stage'),sl=document.querySelector('.bgp-slide').getBoundingClientRect();return s.scrollWidth<=s.clientWidth+1&&sl.right<=innerWidth+1&&sl.left>=-1});if(!o)bad.push(i)}
 const contr=await p.evaluate(()=>{const par=x=>{const m=/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(x);return [+m[1],+m[2],+m[3]]};const L=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};const cr=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};const bg=par(getComputedStyle(document.getElementById('bgp')).backgroundColor);return {fg:cr(par(getComputedStyle(document.getElementById('bgp')).color),bg),sec:cr(par(getComputedStyle(document.querySelector('.bgp-kicker')||document.getElementById('bgp-sec')).color),bg)}});
 ok((dark?'dark':'light')+' 1280x720 (week 2): every third slide fits the screen; text contrast: main '+contr.fg.toFixed(1)+':1, labels '+contr.sec.toFixed(1)+':1 (min 4.5)',bad.length===0&&contr.fg>=7&&contr.sec>=4.5,{bad,contr});
 ok('  the theme button of the presenter switches the site theme',await (async()=>{const before=await p.evaluate(()=>getComputedStyle(document.getElementById('bgp')).backgroundColor);await p.click('[data-bgp=theme]');await p.waitForTimeout(150);const after=await p.evaluate(()=>getComputedStyle(document.getElementById('bgp')).backgroundColor);return before!==after})());
 await c.close()}
{const {c,p}=await open('beginners-1.html',{reduced:true,desktop:true,vp:{width:1280,height:720}});await pres(p);await goKind(p,'stroke',0);
 ok('reduced motion: the stroke drawing and contour animations are switched off (final shape shown at once), navigation still works',await p.evaluate(()=>{const a=document.querySelector('.bgp-stroke.play .a');return a&&getComputedStyle(a).animationName==='none'||parseFloat(getComputedStyle(a).animationDuration)<=0.001})&&(await p.keyboard.press('ArrowRight'),await idx(p)>0));await c.close()}
cp.spawnSync('true');
server.close();await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
