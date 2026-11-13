/* Feedback sounds test, lessons (Phase 6c).   node tools/lsn3/t16.js [lesson.html]     (run from the repo root; default lesson-9.html; also run on lesson-7.html)
   The master switch (settings sheet «الأصوات» = the flashcard's speaker button) is OFF by default and controls every sound including the page-turn swish.
   With it off nothing is created or played; before any gesture nothing is created; with it on each sound is requested at the right events and made by the audio
   layer (a mock AudioContext records oscillators, noise buffers, gains, durations); an old swish setting survives (migration); no sound on load or navigation;
   silent without Web Audio; no new storage key; the settings sheet fits 360px in light and dark. Speech (pronunciation) is not part of this. Real device audio,
   loudness and iOS cannot be tested here. */
const fs=require('fs');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright','/opt/node22/lib/node_modules/playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const R='file://'+process.cwd()+'/',PAGE=process.argv[2]||process.env.PAGE||'lesson-9.html';
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(!c&&x!==undefined?'  '+(typeof x==='string'?x:JSON.stringify(x)):''));if(!c)fails++};
function init(o){
 if(o.noAudio){delete window.AudioContext;delete window.webkitAudioContext}
 else{window.__ac=0;window.__ev=[];window.__g=[];
  window.AudioContext=function(){window.__ac++;this.state='suspended';this.currentTime=10;this.sampleRate=8000;this.destination={};
   this.resume=()=>{this.state='running';return Promise.resolve()};
   this.createBuffer=(c,n)=>({getChannelData:()=>new Float32Array(n)});
   this.createBufferSource=()=>({connect(){},start(t){window.__ev.push({k:'noise',t0:t,t1:t+.17})},stop(){}});
   this.createOscillator=()=>{const e={k:'osc',f:0,type:''};const self=this;return {set type(v){e.type=v},get type(){return e.type},frequency:{setValueAtTime(v){e.f=v},exponentialRampToValueAtTime(){}},connect(){},start(t){e.t0=t},stop(t){e.t1=t;window.__ev.push(e)}}};
   this.createBiquadFilter=()=>({Q:{value:0},frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});
   this.createGain=()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(v){window.__g.push(v)}},connect(){}})};
  window.webkitAudioContext=window.AudioContext}
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{lang:'zh-CN',name:'M'}],speak(){},cancel(){},addEventListener(){},removeEventListener(){}}});window.SpeechSynthesisUtterance=function(t){this.text=t};
 /* spy on zhUI.play (the single audio entry point used by the pages) as soon as zh-ui.js has run */
 window.__calls=[];document.addEventListener('DOMContentLoaded',()=>{if(window.zhUI&&zhUI.play){const f=zhUI.play;zhUI.play=function(k){window.__calls.push(k);return f.apply(this,arguments)}}});
}
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
async function open(o={}){const c=await b.newContext({viewport:{width:360,height:780},hasTouch:true,colorScheme:o.dark?'dark':'light',reducedMotion:o.reduced?'reduce':'no-preference'});
 await c.addInitScript(init,o);
 if(o.store)await c.addInitScript(([k,v])=>{if(localStorage.getItem('__seeded')===null){localStorage.setItem(k,v);localStorage.setItem('__seeded','1')}},o.store);
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(R+(o.page||PAGE));await p.waitForTimeout(500);return {c,p}}
const st=p=>p.evaluate(()=>({ac:window.__ac,ev:window.__ev.length,calls:window.__calls.slice()}));
const clear=p=>p.evaluate(()=>{window.__ev.length=0;window.__calls.length=0;window.__g.length=0});
const tab=async(p,t)=>{await p.click('[data-tab='+t+']');await p.waitForTimeout(150)};
const opt=(p,right)=>p.evaluate(r=>{const q=window.__q();const it=q.list[q.i];return it.opts.findIndex(o=>!!o.ok===r)},right);
async function answer(p,right){const i=await opt(p,right);await p.click('#qbody .opt:nth-child('+(i+1)+')');await p.waitForTimeout(60)}
async function quiz(p,pattern){await tab(p,'practice');await p.click('[data-act=start][data-k=meaning]');await p.waitForTimeout(100);for(const r of pattern){await answer(p,r);await p.click('#qnext');await p.waitForTimeout(40)}await p.waitForTimeout(150)}

console.log('--- default: off, nothing is created or played ('+PAGE+')');
{const {c,p}=await open();
 ok('the master switch is off by default (card button not pressed, nothing stored)',await p.$eval('.fcsnd',e=>e.getAttribute('aria-pressed')==='false')&&await p.evaluate(()=>!(JSON.parse(localStorage.getItem('zh-ui-v1')||'{}').study||{}).sound));
 await tab(p,'dialogue');await tab(p,'grammar');await tab(p,'vocab');
 ok('nothing is requested or created on load and while moving between tabs',JSON.stringify(await st(p))===JSON.stringify({ac:0,ev:0,calls:[]}),await st(p));
 await clear(p);await p.click('#fc',{position:{x:150,y:150}});await p.waitForTimeout(800);await p.click('[data-act=know]');await p.waitForTimeout(200);
 await quiz(p,[true,false,true,true,true]);
 const s=await st(p);
 ok('with the switch off the pages still ask for sounds (ok / no / done) but the audio layer makes none: no AudioContext, no oscillator, no noise',s.ac===0&&s.ev===0&&s.calls.includes('ok')&&s.calls.includes('no'),s);
 const keys=await p.evaluate(()=>Object.keys(localStorage));
 ok('no new storage key',keys.every(k=>/^(noor-|zh-ui-v1$|zh-hub-v1$|__seeded$)/.test(k)),keys);
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}

console.log('--- the master switch in the settings sheet');
{const {c,p}=await open();
 await p.click('[data-zh=open]');await p.waitForTimeout(150);
 ok('the sheet has «الأصوات» with one switch, off',await p.$eval('.zh-sheet',e=>/الأصوات/.test(e.textContent))&&await p.$eval('[data-zh=swish]',e=>e.getAttribute('aria-pressed')==='false'));
 ok('the sheet fits 360px and the switch is at least 44px high',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('[data-zh=swish]').getBoundingClientRect().height>=44));
 ok('no AudioContext yet (opening the sheet is not a gesture on the switch)',(await st(p)).ac===0);
 await p.click('[data-zh=swish]');await p.waitForTimeout(100);
 ok('turning it on (a gesture) creates the AudioContext, saves study.sound=1 inside zh-ui-v1, and the card button follows',await p.evaluate(()=>window.__ac===1&&JSON.parse(localStorage.getItem('zh-ui-v1')).study.sound===1));
 await p.click('[data-zh=close]');await p.waitForTimeout(100);
 ok('the flashcard button now shows it as on (same master switch)',await p.$eval('.fcsnd',e=>e.getAttribute('aria-pressed')==='true'));
 await c.close()}

console.log('--- each sound at the right event (switch on)');
{const {c,p}=await open({store:['zh-ui-v1',JSON.stringify({study:{sound:1}})]});
 ok('saved "on": nothing exists before the first gesture, and nothing was requested on load',JSON.stringify(await st(p))===JSON.stringify({ac:0,ev:0,calls:[]}),await st(p));
 await p.mouse.click(5,300);await p.waitForTimeout(80);await clear(p);
 await p.click('#fc',{position:{x:150,y:150}});await p.waitForTimeout(800);
 let s=await st(p);ok('flip = page-turn swish (one noise)',JSON.stringify(s.calls)==='["swish"]'&&s.ev===1,s);
 await clear(p);await p.click('[data-act=next]');await p.waitForTimeout(100);s=await st(p);ok('next card = swish',JSON.stringify(s.calls)==='["swish"]',s);
 await clear(p);await p.click('[data-act=know]');await p.waitForTimeout(100);s=await st(p);
 ok('«عرفتها» = the correct chime only (no swish on top)',JSON.stringify(s.calls)==='["ok"]'&&s.ev===2,s);
 await clear(p);await p.click('[data-act=again]');await p.waitForTimeout(100);s=await st(p);ok('«أراجعها لاحقاً» = swish only (it is a page turn, not a right or wrong answer)',JSON.stringify(s.calls)==='["swish"]',s);
 await tab(p,'practice');await p.click('[data-act=start][data-k=meaning]');await p.waitForTimeout(100);await clear(p);
 await answer(p,true);s=await st(p);ok('right answer = the "ok" chime: two soft sine notes',JSON.stringify(s.calls)==='["ok"]'&&s.ev===2,s);
 await p.click('#qnext');await clear(p);await answer(p,false);s=await st(p);ok('wrong answer = the soft low "no" tone: one note',JSON.stringify(s.calls)==='["no"]'&&s.ev===1,s);
 const ev=await p.evaluate(()=>window.__ev.map(e=>({k:e.k,f:e.f,type:e.type})));
 ok('  it is a low triangle tone (under 300Hz), not a harsh buzz',ev[0].type==='triangle'&&ev[0].f<300,ev);
 await p.click('#qnext');await answer(p,true);await p.click('#qnext');await answer(p,true);await p.click('#qnext');await clear(p);
 await answer(p,true);await p.click('#qnext');await p.waitForTimeout(250);s=await st(p);
 ok('finishing the quiz = ONE flourish: the last answer\'s chime, then a single "done" (the first-quiz badge brings its own stamp, so not two flourishes)',s.calls.filter(x=>x==='done').length===1,s);
 await clear(p);await p.click('[data-act=start][data-k=meaning]');await p.waitForTimeout(100);
 for(let i=0;i<5;i++){await answer(p,true);await p.click('#qnext');await p.waitForTimeout(40)}await p.waitForTimeout(250);s=await st(p);
 ok('a second perfect quiz (no new badge): exactly one "done" flourish for the finish',s.calls.filter(x=>x==='done').length===1&&s.calls.filter(x=>x==='ok').length===5,s);
 await clear(p);await p.click('[data-act=start][data-k=meaning]');await p.waitForTimeout(100);
 for(let i=0;i<5;i++){await answer(p,i<1);await p.click('#qnext');await p.waitForTimeout(40)}await p.waitForTimeout(250);s=await st(p);
 ok('a poor result (20%) ends without the flourish (it only celebrates 60% and up)',!s.calls.includes('done')&&s.calls.filter(x=>x==='no').length===4,s);
 ok('every sound is under 400ms and quiet (gain peak 0.2 or less)',await p.evaluate(()=>window.__ev.every(e=>(e.t1-e.t0)<.4)&&Math.max(...window.__g)<=.2));
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}
{const {c,p}=await open({store:['zh-ui-v1',JSON.stringify({study:{sound:1}})]});await p.mouse.click(5,300);
 const dur=async k=>{await clear(p);await p.evaluate(k=>zhUI.play(k),k);return p.evaluate(()=>{const e=window.__ev;return {n:e.length,span:Math.max(...e.map(x=>x.t1))-Math.min(...e.map(x=>x.t0)),k:e.map(x=>x.k+(x.f?Math.round(x.f):''))}})};
 const r={};for(const k of ['swish','ok','no','done'])r[k]=await dur(k);
 ok('each sound lasts under 400ms in total (swish '+r.swish.span.toFixed(2)+'s, ok '+r.ok.span.toFixed(2)+'s, no '+r.no.span.toFixed(2)+'s, done '+r.done.span.toFixed(2)+'s)',Object.values(r).every(x=>x.span>0&&x.span<.4),r);
 ok('the four sounds are different (noise / two notes / one low note / three rising notes)',r.swish.k[0]==='noise'&&r.ok.k.length===2&&r.no.k.length===1&&r.done.k.length===3&&new Set([r.ok.k.join(),r.no.k.join(),r.done.k.join()]).size===3,r);
 await c.close()}

console.log('--- levels challenge (same sounds)');
{const {c,p}=await open({store:['zh-ui-v1',JSON.stringify({study:{sound:1}})]});await p.mouse.click(5,300);
 await tab(p,'practice');
 if(await p.$('[data-act=lvhub]')){await p.click('[data-act=lvhub]');await p.waitForTimeout(150);await p.click('[data-act=lvstart][data-n="1"]');await p.waitForTimeout(150);await clear(p);
  let n=0;for(let i=0;i<12&&!await p.$('#p-practice .res');i++){
   const t=await p.evaluate(()=>{const q=window.__q();const it=q.list[q.i];return {type:it.type,n:it.opts?it.opts.length:0,words:it.words?it.words.length:0}});
   if(t.type==='match'){for(let k=0;k<t.words;k++){await p.click('#qbody [data-act=ml][data-i="'+k+'"]');await p.click('#qbody [data-act=mr][data-i="'+k+'"]')}}
   else if(t.n){await answer(p,true)}else break;
   n++;await p.waitForTimeout(80);const nx=await p.$('#qnext');if(nx&&await nx.isVisible())await nx.click();await p.waitForTimeout(60)}
  await p.waitForTimeout(300);const s=await st(p);
  ok('levels challenge, all answered right: every question chimes "ok" and the level ends with ONE "done" flourish',s.calls.filter(x=>x==='ok').length>=6&&s.calls.filter(x=>x==='done').length>=1&&s.calls.filter(x=>x==='no').length===0,s)}
 else ok('(the lesson has no levels challenge: skipped)',true);
 await c.close()}

console.log('--- the master switch also controls the swish');
{const {c,p}=await open({store:['zh-ui-v1',JSON.stringify({study:{sound:1}})]});await p.mouse.click(5,300);await clear(p);
 await p.click('#fc',{position:{x:150,y:150}});await p.waitForTimeout(800);const a=await st(p);
 await p.click('.fcsnd');await p.waitForTimeout(100);await clear(p);
 await p.click('#fc',{position:{x:150,y:150}});await p.waitForTimeout(800);await p.click('[data-act=know]');await p.waitForTimeout(200);const b2=await st(p);
 ok('switch on: the flip swish is made; switched off (card button): the flip and the chime are requested but nothing is made',a.ev===1&&b2.ev===0&&b2.calls.length>=2,[a,b2]);
 ok('the sheet switch shows the same state',await (async()=>{await p.click('[data-zh=open]');await p.waitForTimeout(100);return p.$eval('[data-zh=swish]',e=>e.getAttribute('aria-pressed')==='false')})());
 await c.close()}

console.log('--- migration');
{const {c,p}=await open({store:['zh-ui-v1',JSON.stringify({tone:'cb',study:{sound:1,dlgFocus:1,dlgPy:1}})]});
 const s=await p.evaluate(()=>({cfg:JSON.parse(localStorage.getItem('zh-ui-v1')),pressed:document.querySelector('.fcsnd').getAttribute('aria-pressed'),tone:document.documentElement.getAttribute('data-tone')}));
 ok('a student who had turned the swish on keeps the sound on (same key study.sound), and the other saved settings are untouched',s.pressed==='true'&&s.tone==='cb'&&s.cfg.study.dlgFocus===1&&s.cfg.study.dlgPy===1&&s.cfg.tone==='cb',s);
 await c.close()}
{const {c,p}=await open({store:['zh-ui-v1',JSON.stringify({tone:'marks'})]});
 ok('an old state without any study settings: sound off, tone mode kept',await p.$eval('.fcsnd',e=>e.getAttribute('aria-pressed')==='false')&&await p.evaluate(()=>document.documentElement.getAttribute('data-tone')==='marks'));await c.close()}

console.log('--- no Web Audio, reduced motion, themes');
{const {c,p}=await open({noAudio:true});await p.click('.fcsnd');await p.click('#fc',{position:{x:150,y:150}});await p.waitForTimeout(800);await quiz(p,[true,false,true,true,true]);
 ok('without Web Audio: switching on and playing everything fails silently (no errors, the quiz works, the summary shows)',p.errs.length===0&&!!await p.$('#p-practice .sum'),p.errs);await c.close()}
{const {c,p}=await open({reduced:true,store:['zh-ui-v1',JSON.stringify({study:{sound:1}})]});await p.mouse.click(5,300);await clear(p);await quiz(p,[true,true,true,true,true]);const s=await st(p);
 ok('reduced motion does not turn the sounds off (they are a separate setting)',s.calls.includes('ok')&&s.ev>0,s);await c.close()}
for(const dark of [false,true]){const {c,p}=await open({dark});await p.click('[data-zh=open]');await p.waitForTimeout(150);
 ok((dark?'dark':'light')+': the settings sheet with «الأصوات» fits 360px and its text keeps AA contrast (muted line under the title >= 4.5:1)',await p.evaluate(()=>{const par=c=>{const m=/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(c);return m?[+m[1],+m[2],+m[3]]:null};const L=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};const sub=document.querySelector('.zh-sub'),row=document.querySelector('[data-zh=swish]');const a=par(getComputedStyle(sub).color),bg=par(getComputedStyle(row).backgroundColor)||[255,255,255];const x=L(a),y=L(bg);const cr=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);return document.documentElement.scrollWidth<=innerWidth&&cr>=4.5}));await c.close()}
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
