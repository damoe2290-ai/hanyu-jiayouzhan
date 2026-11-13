/* Hub test: sounds in the hub and removal of the old welcome screen (Phase 6c).   node tools/hubt/t17.js     (run from the repo root; the hub is index.html)
   Sounds in the hub's games: off by default (nothing made, nothing before a gesture), ok / no / done when on, nothing on load or navigation, the master switch
   «الأصوات» in the settings sheet. No welcome dialog exists any more (a fresh visitor sees the normal hub, nothing blocks it); no goal picker and no «إعادة إعداد»;
   the daily goal is the fixed 50 of levels.json; the hub opens the level of the last lesson, otherwise level 1; fields an earlier welcome screen may have stored
   (welcome, goal, startLevel) are ignored and removed from zh-hub-v1 without touching anything else. Real device audio, loudness and iOS are not testable here. */
const fs=require('fs');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright','/opt/node22/lib/node_modules/playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const R='file://'+process.cwd()+'/',HUBF=process.env.HUB||'index.html';
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(!c&&x!==undefined?'  '+(typeof x==='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const T0=new Date('2026-06-01T10:00:00Z');
function audioInit(){
 window.__ac=0;window.__ev=0;window.__calls=[];
 window.AudioContext=function(){window.__ac++;this.state='suspended';this.currentTime=10;this.sampleRate=8000;this.destination={};this.resume=()=>{this.state='running';return Promise.resolve()};
  this.createBuffer=(c,n)=>({getChannelData:()=>new Float32Array(n)});this.createBufferSource=()=>({connect(){},start(){window.__ev++},stop(){}});
  this.createOscillator=()=>({type:'',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){window.__ev++},stop(){}});
  this.createBiquadFilter=()=>({Q:{value:0},frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});
  this.createGain=()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};window.webkitAudioContext=window.AudioContext;
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{lang:'zh-CN',name:'M'}],speak(){},cancel(){},addEventListener(){},removeEventListener(){}}});window.SpeechSynthesisUtterance=function(t){this.text=t};
 document.addEventListener('DOMContentLoaded',()=>{if(window.zhUI&&zhUI.play){const f=zhUI.play;zhUI.play=function(k){window.__calls.push(k);return f.apply(this,arguments)}}});
}
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
async function open(init={},o={}){const c=await b.newContext({viewport:{width:o.w||360,height:780},isMobile:(o.w||360)<500,hasTouch:true,colorScheme:o.dark?'dark':'light',timezoneId:'UTC'});
 await c.addInitScript(audioInit);
 await c.addInitScript(([init])=>{if(localStorage.getItem('__seeded')===null){for(const k in init)localStorage.setItem(k,typeof init[k]==='string'?init[k]:JSON.stringify(init[k]));localStorage.setItem('__seeded','1')}},[init]);
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|net::|Failed to load|ERR_/.test(m.text()))p.errs.push(m.text())});
 if(o.clock)await p.clock.install({time:T0});
 await p.goto(R+(o.page||HUBF));await p.waitForTimeout(300);return {c,p}}
const hubS=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')||'null'));
const uiS=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('zh-ui-v1')||'null'));
const shown=p=>p.$eval('#wel',e=>true).catch(()=>false);
const openLevels=p=>p.$$eval('details.lvl[data-lv]',e=>e.filter(x=>x.open).map(x=>x.dataset.lv));
const ringLabel=p=>p.$eval('.dg .ring',e=>e.getAttribute('aria-label')).catch(()=>null);

console.log('--- no welcome screen any more; goal 50; level opening as before');
{const {c,p}=await open();
 ok('a fresh visitor sees the normal hub: no dialog, nothing blocks it, no goal picker anywhere',await p.$('#wel')===null&&await p.$('.wl')===null&&await p.evaluate(()=>typeof window.zhHubWelcome==='undefined'&&!document.body.innerText.includes('أهلاً بك! لنُعدّ'))&&await p.evaluate(()=>getComputedStyle(document.documentElement).overflow!=='hidden'));
 ok('the daily goal is the fixed 50 (data in levels.json), "done" is 90%, and level 1 is open by default',/من 50/.test(await ringLabel(p)||'')&&await p.evaluate(()=>GOAL===50&&DONE_AT===90)&&JSON.stringify(await openLevels(p))==='["1"]',[await ringLabel(p),await openLevels(p)]);
 await p.click('[data-zh=open]');await p.waitForTimeout(150);
 ok('the settings sheet has the sounds switch («الأصوات») and no «إعادة إعداد» row',await p.$('[data-zh=swish]')!==null&&await p.$('[data-zh=welcome]')===null&&!(await p.$eval('.zh-sheet',e=>e.textContent)).includes('إعادة إعداد'));
 ok('nothing is written to storage just by visiting (no welcome flag)',!(await hubS(p)||{}).welcome&&!(await hubS(p)||{}).goal&&!(await hubS(p)||{}).startLevel);
 await c.close()}
{const {c,p}=await open({'zh-hub-v1':{pts:{'2026-05-30':5},lastLesson:'lesson-9.html'}});
 ok('with a last lesson, the hub opens the level of that lesson (level 1 for Grammar), as before',JSON.stringify(await openLevels(p))==='["1"]',await openLevels(p));await c.close()}
{const {c,p}=await open({'zh-hub-v1':{pts:{'2026-05-30':5},lastLesson:'lis-6.html'}});
 ok('last lesson in Listening: level 3 opens',JSON.stringify(await openLevels(p))==='["3"]',await openLevels(p));await c.close()}
console.log('--- migration: fields of the removed welcome screen');
for(let attempt=0;attempt<3;attempt++){const old={dues:{gram:{'点':{i:1,t:1}},fl:{},cult:{},prac:{},lis:{},biz:{}},pts:{'2026-05-30':12},days:['2026-05-30'],lastLesson:'lis-6.html',xpSum:7,welcome:{done:1,level:5,goal:80},goal:80,startLevel:5,gbest:{ta:12}};
 const {c,p}=await open({'zh-hub-v1':old});
 const s=await hubS(p);
 if(!s||s.welcome!==undefined){await c.close();continue}   /* never expected: the page cleans the stale fields at load */
 ok('stored welcome, goal and startLevel are ignored (the ring uses 50, the last lesson decides the level: level 3) and removed from zh-hub-v1',/من 50/.test(await ringLabel(p)||'')&&JSON.stringify(await openLevels(p))==='["3"]'&&s.welcome===undefined&&s.goal===undefined&&s.startLevel===undefined,[s,await ringLabel(p),await openLevels(p)]);
 ok('every other field is untouched (review words, points, days, last lesson, game records; the XP snapshot belongs to zh-ui.js and is re-measured on every page, as before)',JSON.stringify(s.dues.gram)===JSON.stringify(old.dues.gram)&&s.pts['2026-05-30']===12&&JSON.stringify(s.days)===JSON.stringify(old.days)&&s.lastLesson==='lis-6.html'&&JSON.stringify(s.gbest)===JSON.stringify(old.gbest),s);
 ok('no welcome dialog, no page errors',await p.$('#wel')===null&&p.errs.length===0,p.errs);
 await c.close();break}
{const {c,p}=await open({'zh-hub-v1':{pts:{'2026-05-30':5},xpSum:3}});const before=await hubS(p);
 ok('a state without those fields keeps its other fields as they were',before.pts['2026-05-30']===5&&before.welcome===undefined&&before.goal===undefined);await c.close()}

console.log('--- sounds in the hub\'s games');
const U=['点','半','起床'];
async function game(sound){const dues={gram:{},fl:{},cult:{},prac:{},lis:{},biz:{}};
 const {c,p}=await open({'zh-hub-v1':{welcome:{done:1},dues:{gram:{}}},'zh-ui-v1':sound?{study:{sound:1}}:{}},{clock:true});
 await p.evaluate(()=>{window.crs='gram';tab='rev';render()});await p.clock.pauseAt(new Date(T0.getTime()+5000));
 await p.mouse.click(5,300);await p.waitForTimeout(50);
 await p.evaluate(()=>{window.__calls.length=0;window.__ev=0});
 await p.click('[data-gstart="ta"]');await p.waitForTimeout(80);return {c,p}}
const pickG=async(p,right)=>{const i=await p.evaluate(r=>G.q.opts.findIndex(o=>o.ok===r),right);await p.click('[data-gopt="'+i+'"]');await p.clock.runFor(right?500:900)};
{const {c,p}=await game(false);
 await pickG(p,true);await pickG(p,false);await p.evaluate(()=>gEnd());await p.waitForTimeout(80);
 const s=await p.evaluate(()=>({calls:window.__calls.slice(),ev:window.__ev,ac:window.__ac}));
 ok('switch off: the games request ok / no / done but nothing is made (no AudioContext, no oscillator)',s.ac===0&&s.ev===0&&s.calls.join()==='ok,no,done',s);await c.close()}
{const {c,p}=await game(true);
 await pickG(p,true);let s=await p.evaluate(()=>({calls:window.__calls.slice(),ev:window.__ev}));
 ok('switch on: a right answer in time attack = the "ok" chime (two notes)',s.calls.join()==='ok'&&s.ev===2,s);
 await pickG(p,false);s=await p.evaluate(()=>({calls:window.__calls.slice(),ev:window.__ev}));
 ok('a wrong answer = the soft "no" tone (one note)',s.calls.join()==='ok,no'&&s.ev===3,s);
 await p.evaluate(()=>gEnd());await p.waitForTimeout(80);s=await p.evaluate(()=>({calls:window.__calls.slice(),ev:window.__ev}));
 ok('the end of the round = the "done" flourish (three notes)',s.calls.join()==='ok,no,done'&&s.ev===6,s);
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}
{const {c,p}=await open({'zh-hub-v1':{welcome:{done:1}},'zh-ui-v1':{study:{sound:1}}});
 ok('nothing is requested or made on load or while moving around the hub (sound on, no gesture yet)',await p.evaluate(()=>window.__ac===0&&window.__ev===0&&window.__calls.length===0));
 await p.click('[data-go=tea]').catch(()=>{});await p.waitForTimeout(100);await p.click('[data-go=home]').catch(()=>{});await p.waitForTimeout(100);
 ok('...nor on navigation (tabs, courses)',await p.evaluate(()=>window.__ev===0&&window.__calls.length===0));await c.close()}

console.log('--- the hub at 360px with the sound switch (light and dark)');
for(const dark of [false,true]){const {c,p}=await open({},{dark});
 await p.click('[data-zh=open]');await p.waitForTimeout(150);
 const r=await p.evaluate(()=>{const par=x=>{const m=/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(x);return [+m[1],+m[2],+m[3]]};const L=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};const cr=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};const row=document.querySelector('[data-zh=swish]');return {fit:document.documentElement.scrollWidth<=innerWidth,sub:cr(par(getComputedStyle(document.querySelector('.zh-sub')).color),par(getComputedStyle(row).backgroundColor)),h:row.getBoundingClientRect().height}});
 ok((dark?'dark':'light')+': the hub and its settings sheet with «الأصوات» fit 360px, the switch is 44px high, its explanation has AA contrast ('+r.sub.toFixed(2)+':1)',r.fit&&r.h>=44&&r.sub>=4.5&&p.errs.length===0,r);await c.close()}
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
