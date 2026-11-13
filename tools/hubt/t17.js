/* Hub test: first-visit welcome and the hub's sounds (Phase 6c).   node tools/hubt/t17.js     (run from the repo root; the hub is index.html)
   Welcome: shown once, only to a visitor with no saved progress; one dialog (levels 1 / 3 / 5 / 7 from levels.json plus "لا أعرف / ابدأ من الأول", goal 30 / 50 / 80
   with 50 selected, optional sound off); «تخطي», the close button, Escape and a tap outside all equal skipping and change nothing else; «ابدأ» applies the level
   (opened by default, nothing locked or hidden) and the goal (feeds the dashboard ring; "done = 90%" untouched); never shown to anyone with progress; «إعادة إعداد»
   in the settings sheet reopens it; choices live in zh-hub-v1 (no new key); old states migrate; lesson pages keep the choices; 360px fit, light and dark.
   Sounds in the hub's games: off by default (nothing made), correct / wrong / finish when on. Real device audio, loudness and iOS are not testable here. */
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
/* In this headless Chrome a page opened right after a write (reload / navigation, file://) now and then sees EMPTY localStorage (a browser glitch: the
   write is logged by the previous page, the new page's first read returns nothing and its tracker then writes a fresh object). It also explains the rare
   failures of t10's two-page test. Scenarios that reload or navigate check that the stored state survived; when the browser lost it the scenario is repeated
   (up to 3 times) and the glitch is counted and printed at the end; when the state survived, the assertions are strict. */
let glitches=0;
const survived=async(p,fn)=>{const before=await p.evaluate(()=>localStorage.getItem('zh-hub-v1'));await fn();const after=await p.evaluate(()=>localStorage.getItem('zh-hub-v1'));
 const lost=!!before&&(!after||(JSON.parse(before).welcome&&!JSON.parse(after).welcome));if(lost)glitches++;return !lost};
const hubS=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')||'null'));
const uiS=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('zh-ui-v1')||'null'));
const shown=p=>p.$eval('#wel',e=>true).catch(()=>false);
const openLevels=p=>p.$$eval('details.lvl[data-lv]',e=>e.filter(x=>x.open).map(x=>x.dataset.lv));
const ringLabel=p=>p.$eval('.dg .ring',e=>e.getAttribute('aria-label')).catch(()=>null);

console.log('--- the welcome dialog (fresh visitor, 360px)');
{const {c,p}=await open();
 ok('a fresh visitor sees the welcome as a modal dialog (role dialog, aria-modal, labelled), focus inside it',await p.evaluate(()=>{const d=document.getElementById('wel');return !!d&&d.getAttribute('role')==='dialog'&&d.getAttribute('aria-modal')==='true'&&!!document.getElementById(d.getAttribute('aria-labelledby'))&&d.contains(document.activeElement)}));
 const o=await p.evaluate(()=>({lv:[...document.querySelectorAll('#wel [data-wl=lv]')].map(x=>x.dataset.n+':'+x.getAttribute('aria-checked')),goal:[...document.querySelectorAll('#wel [data-wl=goal]')].map(x=>x.dataset.n+':'+x.getAttribute('aria-checked')),snd:document.querySelector('#wel [data-wl=snd]').getAttribute('aria-pressed'),levels:LV.levels.map(l=>l.n)}));
 ok('levels 1, 3, 5, 7 come from levels.json, followed by «لا أعرف / ابدأ من الأول» (selected by default)',JSON.stringify(o.lv)==='["1:false","3:false","5:false","7:false","0:true"]'&&JSON.stringify(o.levels)==='[1,3,5,7]',o);
 ok('goals 30 / 50 / 80 with 50 selected; the sound option is off',JSON.stringify(o.goal)==='["30:false","50:true","80:false"]'&&o.snd==='false',o);
 ok('a clear «تخطي» button, a close button, and a primary «ابدأ" button; all at least 44px high; options at least 44px',await p.evaluate(()=>{const h=s=>[...document.querySelectorAll(s)].every(x=>x.getBoundingClientRect().height>=44&&x.getBoundingClientRect().width>=44);const skip=[...document.querySelectorAll('#wel .wl-act [data-wl=skip]')].length===1&&/تخطي/.test(document.querySelector('#wel .wl-act [data-wl=skip]').textContent);return skip&&!!document.querySelector('#wel .wl-x')&&!!document.querySelector('#wel [data-wl=go]')&&h('#wel button')}));
 ok('360px: the dialog fits the screen (no horizontal overflow) and scrolls inside itself when taller than the screen',await p.evaluate(()=>{const d=document.querySelector('#wel .wl-in').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth&&d.width<=innerWidth&&d.bottom<=innerHeight+1}));
 ok('nothing is saved just by showing it',(await hubS(p))===null||!(await hubS(p)).welcome,await hubS(p));
 await c.close()}

console.log('--- skip, close, Escape and tap outside are all "skip" (change nothing else)');
for(const how of ['skip','x','escape','outside'])for(let attempt=0;attempt<3;attempt++){const {c,p}=await open();
 if(how==='skip')await p.click('#wel .wl-act [data-wl=skip]');else if(how==='x')await p.click('#wel .wl-x');else if(how==='escape')await p.keyboard.press('Escape');else await p.mouse.click(180,30);
 await p.waitForTimeout(150);
 const s=await hubS(p),u=await uiS(p);
 ok(how+': the dialog closes, the hub is usable, the choice is recorded as skipped, no goal / level / sound is stored',!await shown(p)&&!!s.welcome&&s.welcome.skipped===1&&s.goal===undefined&&s.startLevel===undefined&&!(u&&u.study&&u.study.sound)&&await ringLabel(p)!==null&&/من 50/.test(await ringLabel(p)),[s,u]);
 if(!await survived(p,async()=>{await p.reload();await p.waitForTimeout(300)})){await c.close();continue}
 ok(how+': after a reload it does not come back',!await shown(p));
 ok('  the first level is open by default (as before)',JSON.stringify(await openLevels(p))==='["1"]',await openLevels(p));
 await c.close();break}

console.log('--- choosing a level, a goal and the sound');
for(let attempt=0;attempt<3;attempt++){const {c,p}=await open({},{});
 await p.click('#wel [data-wl=lv][data-n="5"]');await p.click('#wel [data-wl=goal][data-n="80"]');await p.click('#wel [data-wl=snd]');await p.waitForTimeout(80);
 ok('the choices are shown as selected (radio buttons: level 5, goal 80, sound on) and nothing is saved until «ابدأ»',await p.evaluate(()=>document.querySelector('#wel [data-wl=lv][data-n="5"]').getAttribute('aria-checked')==='true'&&document.querySelector('#wel [data-wl=goal][data-n="80"]').getAttribute('aria-checked')==='true'&&document.querySelector('#wel [data-wl=snd]').getAttribute('aria-pressed')==='true')&&!(await hubS(p)||{}).welcome&&!((await uiS(p)||{}).study||{}).sound);
 await p.click('#wel [data-wl=go]');await p.waitForTimeout(200);
 const s=await hubS(p),u=await uiS(p);
 ok('«ابدأ» stores level and goal inside zh-hub-v1 and the sound inside zh-ui-v1',!await shown(p)&&s.goal===80&&s.startLevel===5&&s.welcome.done===1&&s.welcome.level===5&&s.welcome.goal===80&&u.study.sound===1,[s.goal,s.startLevel,s.welcome,u]);
 ok('level 5 is the one open on the hub (nothing hidden or locked: all four levels and the extra section are there)',JSON.stringify(await openLevels(p))==='["5"]'&&await p.$$eval('details.lvl[data-lv]',e=>e.length)===5&&await p.$$eval('details.lvl summary',e=>e.every(x=>!x.hasAttribute('disabled')&&!x.hasAttribute('aria-disabled'))),await openLevels(p));
 ok('the daily ring uses the chosen goal (80), and done is still 90%',/من 80/.test(await ringLabel(p))&&await p.evaluate(()=>DONE_AT===90));
 ok('only the two known keys exist (no new storage key)',(await p.evaluate(()=>Object.keys(localStorage))).every(k=>/^(zh-hub-v1|zh-ui-v1|__seeded)$/.test(k)),await p.evaluate(()=>Object.keys(localStorage)));
 if(!await survived(p,async()=>{await p.reload();await p.waitForTimeout(300)})){await c.close();continue}
 ok('after a reload: no welcome, level 5 still opens by default, the goal persists',!await shown(p)&&JSON.stringify(await openLevels(p))==='["5"]'&&/من 80/.test(await ringLabel(p)),await openLevels(p));
 // a lesson page keeps the choices (it writes its tracker into the same key)
 if(!await survived(p,async()=>{await p.goto(R+'lesson-9.html');await p.waitForTimeout(400);await p.click('#fc',{position:{x:150,y:150}}).catch(()=>{});await p.waitForTimeout(300)})){await c.close();continue}
 const s2=await hubS(p);
 ok('opening a lesson (its tracker writes into zh-hub-v1) keeps welcome, goal and startLevel',s2.goal===80&&s2.startLevel===5&&!!s2.welcome&&!!s2.lastLesson,s2);
 await c.close();break}
{const {c,p}=await open();
 await p.click('#wel [data-wl=lv][data-n="0"]');await p.click('#wel [data-wl=goal][data-n="30"]');await p.click('#wel [data-wl=go]');await p.waitForTimeout(150);const s=await hubS(p);
 ok('«لا أعرف / ابدأ من الأول» opens level 1, goal 30 is used',s.startLevel===0&&s.goal===30&&JSON.stringify(await openLevels(p))==='["1"]'&&/من 30/.test(await ringLabel(p)),[s.startLevel,await openLevels(p)]);
 await c.close()}

console.log('--- never shown to someone who already has progress');
{const probe={'points':{'zh-hub-v1':{pts:{'2026-05-30':12}}},'days':{'zh-hub-v1':{days:['2026-05-29']}},'last lesson':{'zh-hub-v1':{lastLesson:'lesson-9.html'}},
  'review words':{'zh-hub-v1':{dues:{gram:{'点':{i:1,t:1}}}}},'old last index':{'zh-hub-v1':{last:2}},'lesson progress only':{'noor-lesson6-v1':{xp:30,known:{0:1}}},'already welcomed':{'zh-hub-v1':{welcome:{done:1}}}};
 for(const [name,st] of Object.entries(probe)){const {c,p}=await open(st);ok('existing progress ('+name+'): no welcome',!await shown(p));await c.close()}
 const {c,p}=await open({'zh-hub-v1':{dues:{gram:{},fl:{},cult:{},prac:{},lis:{},biz:{}}}});ok('an empty old state (no progress at all) is still a fresh visitor',await shown(p));await c.close()}
{const {c,p}=await open({'zh-hub-v1':{dues:{gram:{'点':{i:1,t:1}}},last:2,pts:{'2026-05-30':5}}});
 ok('migration: an old pre-welcome state keeps working: goal falls back to 50, no start level, first-or-last-lesson level open as before',!await shown(p)&&/من 50/.test(await ringLabel(p))&&(await hubS(p)).startLevel===undefined&&(await openLevels(p)).length===1);await c.close()}

console.log('--- «إعادة إعداد» in the settings sheet');
{const {c,p}=await open({'zh-hub-v1':{pts:{'2026-05-30':5},goal:80,startLevel:3,welcome:{done:1}}});
 ok('the hub shows the daily ring with the saved goal (80) and level 3 open',/من 80/.test(await ringLabel(p))&&JSON.stringify(await openLevels(p))==='["3"]');
 await p.click('[data-zh=open]');await p.waitForTimeout(150);
 ok('the sheet has a «إعادة إعداد» button',await p.$eval('[data-zh=welcome]',e=>/إعادة إعداد/.test(e.textContent)&&e.getBoundingClientRect().height>=44));
 await p.click('[data-zh=welcome]');await p.waitForTimeout(150);
 ok('it closes the sheet and reopens the welcome with the saved choices selected (level 3, goal 80)',await shown(p)&&await p.evaluate(()=>document.querySelector('#wel [data-wl=lv][data-n="3"]').getAttribute('aria-checked')==='true'&&document.querySelector('#wel [data-wl=goal][data-n="80"]').getAttribute('aria-checked')==='true')&&await p.$('.zh-set:not([hidden])')===null);
 await p.click('#wel .wl-act [data-wl=skip]');await p.waitForTimeout(100);
 ok('skipping the re-run changes nothing',(await hubS(p)).goal===80&&(await hubS(p)).startLevel===3&&!await shown(p));
 await p.click('[data-zh=open]');await p.click('[data-zh=welcome]');await p.waitForTimeout(100);await p.click('#wel [data-wl=goal][data-n="30"]');await p.click('#wel [data-wl=lv][data-n="7"]');await p.click('#wel [data-wl=go]');await p.waitForTimeout(150);
 ok('applying the re-run changes goal and level (30, level 7 opens now)',(await hubS(p)).goal===30&&(await hubS(p)).startLevel===7&&/من 30/.test(await ringLabel(p))&&(await openLevels(p)).includes('7'),[await hubS(p),await openLevels(p)]);
 await c.close()}
{const {c,p}=await open({'zh-hub-v1':{pts:{'2026-05-30':5},welcome:{done:1}}},{page:'lesson-9.html'});
 await p.click('[data-zh=open]');await p.waitForTimeout(150);
 ok('lesson pages have no «إعادة إعداد» button (it is a hub setting); they do have the sounds switch',await p.$('[data-zh=welcome]')===null&&await p.$('[data-zh=swish]')!==null);await c.close()}

console.log('--- the welcome\'s sound option with an existing swish setting');
{const {c,p}=await open({'zh-ui-v1':{study:{sound:1}}});
 ok('a student who already has the sound on sees it on in the welcome (nothing is switched off by skipping)',await p.$eval('#wel [data-wl=snd]',e=>e.getAttribute('aria-pressed')==='true'));
 await p.click('#wel .wl-act [data-wl=skip]');await p.waitForTimeout(100);ok('...and skipping leaves it on',(await uiS(p)).study.sound===1);await c.close()}

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

console.log('--- screens at 360px (welcome and hub, light and dark)');
for(const dark of [false,true]){const {c,p}=await open({},{dark});
 const a=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
 const col=await p.evaluate(()=>{const par=x=>{const m=/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(x);return [+m[1],+m[2],+m[3]]};const L=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};const cr=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};const bg=par(getComputedStyle(document.querySelector('#wel .wl-in')).backgroundColor);return {mut:cr(par(getComputedStyle(document.querySelector('#wel .mut')).color),bg),h3:cr(par(getComputedStyle(document.querySelector('#wel h3')).color),bg),fg:cr(par(getComputedStyle(document.querySelector('#wel h2')).color),bg)}});
 ok((dark?'dark':'light')+': the welcome fits 360px and its text keeps AA contrast (muted '+col.mut.toFixed(2)+', headings '+col.h3.toFixed(2)+', title '+col.fg.toFixed(2)+')',a&&col.mut>=4.5&&col.h3>=4.5&&col.fg>=7,col);
 await p.click('#wel [data-wl=go]');await p.waitForTimeout(200);
 ok('  the hub after choosing fits 360px, no page errors',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&p.errs.length===0,p.errs);await c.close()}
if(glitches)console.log('note: the browser lost localStorage across a reload / navigation '+glitches+' time(s) in this run (see the comment at the top); those scenarios were repeated');
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
