/* Real games test (Phase 3b).   node tools/hubt/t12.js     (run from the repo root; the hub is opened from file:// as index.html)
   Games: memory match, falling words, listen and pick + tone battle, sentence builder race, daily challenge (time attack and the three
   exercises are covered by t11.js). Checks: the games / exercises sections, the no-voice fallback (card disabled with a visible Arabic
   line), every game with a fresh and a pre-populated state, a fake clock for timers and falling motion (injectable GCLK), lives and
   speed ramp, reduced motion, pause when the tab is hidden, memory matching and stars, chip ordering / undo / hint in the sentence
   builder, daily seed determinism and once-per-day scoring, schedule parity with the flashcard buttons, point caps, migration from an
   old state, 44px targets, light/dark, no sounds outside the listening games. */
const fs=require('fs');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const R='file://'+process.cwd()+'/',HUBF=process.env.HUB||'index.html';
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(!c&&x!==undefined?'  '+(typeof x==='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const T0=new Date('2026-06-01T10:00:00Z');
const GAMES=['تحدي الوقت','بطاقات الذاكرة','كلمات تتساقط','استمع واختر','ركّب الجملة','تحدي اليوم'],EXER=['اقرأ بدون بينيين','اكتب من البينيين','اكتب من الترجمة'];
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));

const all=[];
function speechInit([mode]){
 const sp=[];window.__spoken=sp;window.SpeechSynthesisUtterance=function(t){this.text=t;this.lang=''};
 if(mode==='absent'){Object.defineProperty(window,'speechSynthesis',{value:undefined,configurable:true});return}
 const L=[],st={v:mode==='zh'?[{lang:'zh-CN',name:'Mock'}]:mode==='none'?[{lang:'en-US',name:'E'}]:[]};
 const ss={getVoices:()=>st.v,speak:u=>sp.push(u.text),cancel(){},addEventListener(t,f){if(t==='voiceschanged')L.push(f)},removeEventListener(){},__set(v){st.v=v;L.forEach(f=>f())}};
 Object.defineProperty(window,'speechSynthesis',{value:ss,configurable:true});
}
/* a hub page on the review tab of a course, paused fake clock, optional pre-populated localStorage, optional mocked voice */
async function open(init={},o={}){
 const c=await b.newContext({viewport:{width:o.w||360,height:780},isMobile:(o.w||360)<500,hasTouch:true,colorScheme:o.dark?'dark':'light',reducedMotion:o.reduced?'reduce':'no-preference',timezoneId:'UTC'});all.push(c);
 await c.addInitScript(([init])=>{for(const k in init){if(localStorage.getItem(k)===null)localStorage.setItem(k,typeof init[k]==='string'?init[k]:JSON.stringify(init[k]))}},[init]);
 await c.addInitScript(speechInit,[o.voice||'zh']);
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|net::|Failed to load|ERR_/.test(m.text()))p.errs.push(m.text())});
 await p.clock.install({time:o.time||T0});await p.goto(R+HUBF);await p.waitForTimeout(250);
 await p.evaluate(crs=>{window.crs=crs;tab='rev';render()},o.crs||'gram');await p.clock.pauseAt(new Date((o.time||T0).getTime()+5000));return {c,p};
}
const S_=p=>p.evaluate(()=>JSON.parse(JSON.stringify(S)));
const GS=p=>p.evaluate(()=>({mode:G.mode,score:G.score,correct:G.correct,wrong:G.wrong,streak:G.streak,i:G.i,qlen:G.queue&&G.queue.length,over:!!G.over,lives:G.lives,level:G.level}));
const start=async(p,m)=>{await p.click('[data-gstart="'+m+'"]');await p.waitForTimeout(60)};
const run=(p,ms)=>p.clock.runFor(ms);
const today=p=>p.evaluate(()=>today());
let U;{const {c,p}=await open({});U=await p.evaluate(()=>{const s={},o=[];VOCAB_BY.gram.forEach(w=>{if(!s[w.zh]){s[w.zh]=1;o.push({zh:w.zh,py:w.py,ar:w.ar,l:w.l})}});return o});await c.close()}
const dues=(due,later)=>{const d={gram:{},fl:{},cult:{},prac:{},lis:{},biz:{}};U.slice(0,due).forEach(w=>d.gram[w.zh]={i:2,t:T0.getTime()-60000});U.slice(due,due+later).forEach(w=>d.gram[w.zh]={i:2,t:T0.getTime()+1e9});return d};
const POP={'zh-hub-v1':{dues:dues(8,4)},'noor-lesson6-v1':{xp:30,known:{0:1,1:1}}};
const ALLDUE={'zh-hub-v1':{dues:dues(12,0)}};

console.log('--- review tab: the section «ألعاب» (real games) and the section «تمارين» (exercises)');
{const {c,p}=await open({});
 ok('two sections in this order: ألعاب then تمارين',JSON.stringify(await p.$$eval('.gh',e=>e.map(x=>x.textContent)))==='["ألعاب","تمارين"]');
 ok('the games section holds exactly the six games (time attack stays here)',JSON.stringify(await p.$$eval('.games:not(.ex) .gcard b',e=>e.map(x=>x.textContent)))===JSON.stringify(GAMES));
 ok('the exercises section holds exactly the three typed / self-rated modes',JSON.stringify(await p.$$eval('.games.ex .gcard b',e=>e.map(x=>x.textContent)))===JSON.stringify(EXER));
 ok('compact cards with icon, name and one line; all at least 44px; nothing overflows at 360px',await p.$$eval('.gcard',e=>e.every(x=>x.querySelector('svg.ic')&&x.querySelectorAll('b').length===1&&x.querySelectorAll('.mut').length===1&&x.getBoundingClientRect().height>=44))&&await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
 ok('all games are available (nothing disabled when a Chinese voice and sentences exist), no locking',await p.$$eval('.gcard',e=>e.every(x=>!x.disabled)));
 await c.close()}

console.log('--- no Chinese voice: the listening card is disabled WITH a visible Arabic line (never hidden silently)');
{const {c,p}=await open({},{voice:'none'});
 const card=await p.$eval('[data-gstart="listen"]',e=>({dis:e.disabled,aria:e.getAttribute('aria-disabled'),txt:e.querySelector('.mut').textContent,vis:e.offsetParent!==null}));
 ok('voices exist but none is Chinese: disabled, aria-disabled, the one-line hint is on the card',card.dis&&card.aria==='true'&&card.vis&&/لا يوجد صوت صيني/.test(card.txt),card);
 ok('the other games stay available',await p.$$eval('.gcard:not([data-gstart="listen"])',e=>e.every(x=>!x.disabled)));
 await c.close()}
{const {c,p}=await open({},{voice:'absent'});
 ok('no speech support at all: disabled with the "not supported" line',await p.$eval('[data-gstart="listen"]',e=>e.disabled&&/غير مدعوم/.test(e.querySelector('.mut').textContent)));await c.close()}
{const {c,p}=await open({},{voice:'unknown'});
 ok('voices not listed yet: the card stays enabled (no false alarm), exactly as the lessons\' hint does',await p.$eval('[data-gstart="listen"]',e=>!e.disabled));
 await p.evaluate(()=>speechSynthesis.__set([{lang:'en-US',name:'E'}]));
 ok('...and when the voice list arrives without a Chinese voice the card is disabled with its line',await p.$eval('[data-gstart="listen"]',e=>e.disabled&&/لا يوجد صوت صيني/.test(e.querySelector('.mut').textContent)));
 await p.evaluate(()=>speechSynthesis.__set([{lang:'zh-CN',name:'Z'}]));
 ok('...and enabled again when a Chinese voice appears',await p.$eval('[data-gstart="listen"]',e=>!e.disabled));await c.close()}
{const {c,p}=await open({},{crs:'cult'});
 ok('a course without sentences (Culture): the sentence builder is disabled with a visible Arabic line',await p.$eval('[data-gstart="sent"]',e=>e.disabled&&/لا توجد جمل/.test(e.querySelector('.mut').textContent)));await c.close()}

console.log('--- memory match (fresh and pre-populated; fake clock)');
for(const [label,init] of [['fresh',{}],['pre-populated',POP]]){
 const {c,p}=await open(init);await start(p,'mem');
 const g=await p.evaluate(()=>({n:G.cards.length,pairs:G.pairs,cols:getComputedStyle(document.querySelector('.mgrid')).gridTemplateColumns.split(' ').length,down:document.querySelectorAll('.mcard').length,ws:new Set(G.cards.map(c=>c.w.zh)).size,types:G.cards.filter(c=>c.t==='zh').length}));
 ok(label+': 6 pairs = 12 face-down cards in 4 columns (4x3); each word once as character and once as Arabic meaning',g.n===12&&g.pairs===6&&g.cols===4&&g.down===12&&g.ws===6&&g.types===6,g);
 ok(label+': move counter 0, timer 0:00, score 0',await p.$eval('#gmoves',e=>e.textContent)==='0'&&await p.$eval('#gmt',e=>e.textContent)==='0:00');
 await c.close()}
{const {c,p}=await open(ALLDUE);await start(p,'mem');
 const pair=await p.evaluate(()=>{const c=G.cards;const a=c.findIndex(x=>x.t==='zh'&&!x.matched);const b=c.findIndex(x=>x.w===c[a].w&&x.t==='ar');const o=c.findIndex(x=>x.w!==c[a].w&&x.t==='ar');return {a,b,o,w:c[a].w.zh}});
 await p.click('[data-gcard="'+pair.a+'"]');
 ok('flipping a card shows its face (character) and counts nothing yet',await p.$eval('[data-gcard="'+pair.a+'"]',e=>e.classList.contains('open')&&/\p{Script=Han}/u.test(e.textContent))&&await p.$eval('#gmoves',e=>e.textContent)==='0');
 await p.click('[data-gcard="'+pair.o+'"]');
 ok('two cards that do not match: counted as a move; both stay face up for a moment',await p.$eval('#gmoves',e=>e.textContent)==='1'&&await p.evaluate(([a,o])=>G.cards[a].open&&G.cards[o].open&&G.lock,[pair.a,pair.o]));
 await run(p,700);ok('...still open after 0.7 s',await p.evaluate(([a,o])=>G.cards[a].open&&G.cards[o].open,[pair.a,pair.o]));
 await run(p,200);ok('...and flipped back after about 0.8 s, input unlocked',await p.evaluate(([a,o])=>!G.cards[a].open&&!G.cards[o].open&&!G.lock,[pair.a,pair.o]));
 await p.click('[data-gcard="'+pair.a+'"]');await p.click('[data-gcard="'+pair.b+'"]');
 const st=await S_(p);
 ok('a matching pair stays open (done); a pair that followed a miss earns no points and the word is rescheduled as Again',await p.$$eval('.mcard.done',e=>e.length)===2&&(await GS(p)).score===0&&st.dues.gram[pair.w].i===0);
 /* the rest, played without mistakes: right = Good (same step as the flashcard Good button) */
 const rest=await p.evaluate(()=>{const o=[];const seen={};G.cards.forEach((c,i)=>{if(!c.matched){(seen[c.w.zh]=seen[c.w.zh]||[]).push(i)}});return Object.values(seen)});
 const before=(await S_(p)).dues.gram;
 for(const [i,j] of rest){await p.click('[data-gcard="'+i+'"]');await p.click('[data-gcard="'+j+'"]')}
 await run(p,900);
 const gs=await GS(p),sm=await p.evaluate(()=>({stars:G.stars,moves:G.moves,over:G.over,score:G.score}));
 const after=(await S_(p)).dues.gram;
 ok('7 moves in under a minute = 3 stars (+3); 4 clean pairs x 3 points = 12 (the word that shared the miss earns none): 15 points',sm.over&&sm.moves===7&&sm.stars===3&&sm.score===15,sm);
 ok('the 4 clean words moved up one step (Good) like the flashcard Good button; the other word that shared the miss went back to step 0 (Again)',await p.evaluate(([b,a])=>{let n=0,z0=0;for(const z in a){if(b[z]&&a[z].i===b[z].i+1)n++;if(b[z]&&a[z].i===0&&b[z].i!==0)z0++}return n===4&&z0===1},[before,after]));
 ok('end screen: the stars, moves and time, score 15, the two words that needed a second try are listed for practice',await p.$$eval('.gstars .on',e=>e.length)===3&&/7 حركة/.test(await p.$eval('.gend',e=>e.textContent))&&await p.$eval('#gfs',e=>e.textContent)==='15'&&await p.$$eval('.gm1',e=>e.length)===2);
 const today_=await today(p);ok('points went to the daily goal',(await S_(p)).pts[today_]===15&&(await S_(p)).gbest.mem===15);
 ok('play again starts a new board; back returns',await (async()=>{await p.click('[data-gagain]');const a=(await GS(p)).mode==='mem'&&await p.$$eval('.mcard',e=>e.length)===12;await p.click('[data-gexit]');return a&&await p.$('#game')===null})());
 await c.close()}
{const {c,p}=await open(ALLDUE);await start(p,'mem');
 /* stars depend on moves and time: many wrong flips, then a slow finish */
 for(let k=0;k<5;k++){await p.evaluate(()=>{const c=G.cards;const a=c.findIndex(x=>x.t==='zh'&&!x.matched&&!x.open);const o=c.findIndex(x=>x.t==='ar'&&x.w!==c[a].w&&!x.matched&&!x.open);window.__m=[a,o]});const m=await p.evaluate(()=>window.__m);await p.click('[data-gcard="'+m[0]+'"]');await p.click('[data-gcard="'+m[1]+'"]');await run(p,900)}
 await run(p,70000);
 const rest=await p.evaluate(()=>{const seen={};G.cards.forEach((c,i)=>{if(!c.matched)(seen[c.w.zh]=seen[c.w.zh]||[]).push(i)});return Object.values(seen)});
 for(const [i,j] of rest){await p.click('[data-gcard="'+i+'"]');await p.click('[data-gcard="'+j+'"]')}
 await run(p,900);const r=await p.evaluate(()=>({stars:G.stars,moves:G.moves,secs:G.secs,over:G.over}));
 ok('many moves and more than a minute: fewer stars (2 here: 11 moves, about 80 s)',r.over&&r.moves===11&&r.secs>60&&r.secs<=120&&r.stars===2,r);
 await c.close()}

console.log('--- falling words (fake clock drives the motion)');
const fpick=async(p,right,wait)=>{const idx=await p.evaluate(r=>G.q.opts.findIndex(o=>o.ok===r),right);await p.click('[data-gopt="'+idx+'"]');await run(p,wait||(right?300:950))};
const ty=p=>p.$eval('#fw',e=>parseFloat((/translateY\((-?[\d.]+)px/.exec(e.style.transform)||[0,0])[1]));
{const {c,p}=await open(ALLDUE);await start(p,'fall');
 ok('time and animation frames go through an injectable clock object (GCLK.now / raf / caf)',await p.evaluate(()=>typeof GCLK.now==='function'&&typeof GCLK.raf==='function'&&typeof GCLK.caf==='function'));
 const g=await p.evaluate(()=>({lives:G.lives,level:G.level,opts:G.q.opts.length,rm:G.reduced,line:!!document.querySelector('.fline'),on:document.querySelectorAll('#glives .on').length,H:G.H}));
 ok('3 lives (hearts), level 1, a bottom line, 3 meaning buttons at the start, the word at the top',g.lives===3&&g.on===3&&g.level===0&&g.opts===3&&!g.rm&&g.line&&await ty(p)===0,g);
 await run(p,3000);const y=await ty(p);
 ok('after half of the fall time (3 s of 6 s) the word is about half way down',Math.abs(y-g.H*0.5)<=g.H*0.1,{y,H:g.H});
 await c.close()}
{const {c,p}=await open(ALLDUE);await start(p,'fall');
 await fpick(p,true);ok('right answer: +2, streak 1, rescheduled as Good',(await GS(p)).score===2&&(await GS(p)).streak===1);
 await fpick(p,true);await fpick(p,true);ok('combo: 3 right in a row = x2 (the third gives +4), shown on screen',(await GS(p)).score===8&&await p.$eval('#gmul',e=>e.textContent)==='×2');
 await fpick(p,true);await fpick(p,true);
 ok('speed increases every 5 right answers: level 2, the fall time drops from 6 s to 5.55 s',(await GS(p)).level===1&&Math.abs(await p.evaluate(()=>G.life)-5.55)<0.001,await p.evaluate(()=>G.life));
 for(let k=0;k<5;k++)await fpick(p,true);
 ok('after 10 right: level 3, 5.1 s, and now 4 buttons',(await GS(p)).level===2&&Math.abs(await p.evaluate(()=>G.life)-5.1)<0.001&&await p.evaluate(()=>G.q.opts.length)===4);
 await c.close()}
{const {c,p}=await open(ALLDUE);await start(p,'fall');
 const w1=await p.evaluate(()=>G.q.w.zh);const bef=(await S_(p)).dues.gram[w1];
 await run(p,6100);
 ok('a word that reaches the bottom costs a life, resets the streak, is rescheduled as Again and the right meaning is shown',(await GS(p)).lives===2&&await p.$$eval('#glives .on',e=>e.length)===2&&(await GS(p)).wrong===1&&(await S_(p)).dues.gram[w1].i===0&&await p.$eval('.gopt.ok',e=>true));
 await run(p,1000);await fpick(p,false);
 ok('a wrong tap also costs a life',(await GS(p)).lives===1);
 await run(p,1000);await run(p,7000);await run(p,1000);
 const gs=await GS(p);
 ok('with no life left the game ends: summary with score, accuracy and the missed words',gs.over&&gs.lives===0&&await p.$$eval('.gm1',e=>e.length)>=1&&await p.isVisible('#gfs'),gs);
 await c.close()}
{const {c,p}=await open(ALLDUE);await start(p,'fall');
 for(let k=0;k<20;k++)await fpick(p,true);
 const sc=(await GS(p)).score,today_=await today(p),st=await S_(p);
 ok('points are capped at 60 per round (20 right answers would give far more) and the daily goal gets exactly that',sc===60&&st.pts[today_]===60,{sc,pts:st.pts[today_]});
 await c.close()}
{const {c,p}=await open(ALLDUE);await start(p,'fall');await run(p,2000);
 const p1=await p.evaluate(()=>fallProgress());
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
 await run(p,20000);
 ok('while the tab is hidden nothing is lost (no life, game still running)',(await GS(p)).lives===3&&!(await GS(p)).over);
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{get:()=>false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
 const p2=await p.evaluate(()=>fallProgress());
 ok('...and the word continues from where it was when the tab comes back (paused time is not counted)',Math.abs(p2-p1)<0.03&&(await GS(p)).lives===3,{p1,p2});
 await c.close()}
{const {c,p}=await open(ALLDUE,{reduced:true});await start(p,'fall');
 ok('reduced motion: a static countdown ring instead of motion (the word does not move), slower ramp, still playable',await p.$eval('#fall',e=>e.classList.contains('rm'))&&await p.$eval('#fw',e=>e.style.transform==='')&&await p.evaluate(()=>G.reduced&&G.life===6.5));
 const d0=await p.$eval('#fring',e=>parseFloat(e.getAttribute('stroke-dasharray')));await run(p,3000);const d1=await p.$eval('#fring',e=>parseFloat(e.getAttribute('stroke-dasharray')));
 ok('the ring runs down with the time (full at the start, about half after 3 s of 6.5 s)',d0>=282&&d1>130&&d1<170&&await p.$eval('#fw',e=>e.style.transform==='')&&await p.$eval('#fall .fline',e=>getComputedStyle(e).display==='none'),{d0,d1});
 for(let k=0;k<5;k++)await fpick(p,true);
 ok('speed ramp is gentler (6.5 s -> 6.35 s after 5 right answers) and the game works',Math.abs(await p.evaluate(()=>G.life)-6.35)<0.001&&(await GS(p)).score>0);
 await c.close()}
{const {c,p}=await open(ALLDUE);await start(p,'fall');await p.click('[data-gexit]');await run(p,20000);
 ok('leaving the game stops the animation loop and timers (no errors afterwards)',p.errs.length===0&&await p.evaluate(()=>G===null)&&await p.$('#game')===null,p.errs);await c.close()}

console.log('--- listen and pick / tone battle (mocked Chinese voice)');
const lpick=async(p,right,wait)=>{const idx=await p.evaluate(r=>G.q.opts.findIndex(o=>o.ok===r),right);await p.click('[data-gopt="'+idx+'"]');await run(p,wait||(right?900:1700))};
{const {c,p}=await open(POP);await start(p,'listen');
 const w=await p.evaluate(()=>G.cur.zh);
 ok('the word is spoken on its own (zh-CN) as the question appears',await p.evaluate(w=>window.__spoken[0]===w,w));
 ok('four character options (each in a bdi lang zh-CN), exactly one right; two modes on the same screen',await p.$$eval('.gopt bdi[lang="zh-CN"]',e=>e.length)===4&&await p.evaluate(()=>G.q.opts.filter(o=>o.ok).length===1)&&JSON.stringify(await p.$$eval('.gsub .btn',e=>e.map(x=>x.textContent)))==='["اختر الحرف","قتال النغمات"]');
 await p.click('[data-gplay]');ok('the replay button speaks the word again',await p.evaluate(w=>window.__spoken.length===2&&window.__spoken[1]===w,w));
 ok('round of 10 words',(await GS(p)).qlen===10);
 await lpick(p,true);ok('right: +3 points and the next word',(await GS(p)).score===3&&(await GS(p)).i===1);
 await lpick(p,false);ok('wrong: no points, the answer is shown, and the word comes back once',(await GS(p)).score===3&&(await GS(p)).wrong===1&&(await GS(p)).qlen===11);
 await c.close()}
{const {c,p}=await open(POP);await start(p,'listen');await p.click('[data-gsub="tone"]');
 const t=await p.evaluate(()=>({kind:G.q.kind,base:G.q.ti.base,tone:G.q.ti.tone,ch:G.q.ti.ch,texts:[...document.querySelectorAll('.gopt')].map(x=>x.textContent),cls:[...document.querySelectorAll('.gopt .py span')].map(x=>x.className),sp:window.__spoken[window.__spoken.length-1],score:G.score}));
 ok('tone battle: you hear the first syllable and choose among the 4 tone variants of the same pinyin, in tone colours (t1..t4 once each)',t.kind==='tone'&&t.texts.length===4&&['t1','t2','t3','t4'].every(k=>t.cls.filter(x=>x===k).length===1)&&t.sp===t.ch&&t.score===0,t);
 ok('the four options differ only by tone: same letters without marks',await p.evaluate(()=>{const f=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();const b=[...document.querySelectorAll('.gopt')].map(x=>f(x.textContent));return new Set(b).size===1&&b[0]===G.q.ti.base.replace(/v/g,'u')}));
 await lpick(p,true);ok('the right tone: +3',(await GS(p)).score===3);
 await c.close()}
{const {c,p}=await open({'zh-ui-v1':{tone:'numbers'}});await start(p,'listen');await p.click('[data-gsub="tone"]');await run(p,300);
 ok('the tone setting "numbers" is respected: the options show the tone as a number',JSON.stringify(await p.$$eval('.gopt',e=>e.map(x=>x.textContent.trim().replace(/^[a-zü]+/,'')).sort()))==='["1","2","3","4"]',await p.$$eval('.gopt',e=>e.map(x=>x.textContent)));await c.close()}
{const {c,p}=await open({});
 const r=await p.evaluate(()=>{const tab=[['ma',1,'mā'],['ma',3,'mǎ'],['hao',3,'hǎo'],['liu',2,'liú'],['gui',4,'guì'],['nv',3,'nǚ'],['lüe',4,'lüè'],['xie',4,'xiè'],['zhong',1,'zhōng'],['dou',1,'dōu'],['ai',2,'ái'],['uo',4,'uò']];
  const bad=tab.filter(x=>addTone(x[0],x[1])!==x[2]).map(x=>[x[0],x[1],addTone(x[0],x[1]),x[2]]);
  let n=0,mism=[];Object.keys(VOCAB_BY).forEach(k=>VOCAB_BY[k].forEach(w=>{const ti=toneInfo(w);if(!ti)return;n++;const sy=zhUI.syllables(w.py)[0].toLowerCase();if(addTone(ti.base,ti.tone)!==sy)mism.push([w.zh,w.py,addTone(ti.base,ti.tone),sy])}));
  return {bad:bad,n:n,mism:mism.slice(0,5),nm:mism.length}});
 ok('tone marks are placed by the pinyin rules (a, e, ou, else the last vowel; ü) - table of 12 syllables',r.bad.length===0,r.bad);
 ok('round trip for the whole vocabulary of every course: the first syllable rebuilt from its letters and tone equals the original ('+r.n+' words)',r.nm===0&&r.n>200,r);await c.close()}
{const g=await open(ALLDUE);await start(g.p,'listen');
 const queue=await g.p.evaluate(()=>G.queue.map(w=>w.zh));
 for(let k=0;k<40&&!(await g.p.$('.gend'));k++){const first=await g.p.evaluate(q=>G.cur.zh===q,queue[0]);await lpick(g.p,!first)}
 const gd=(await S_(g.p)).dues.gram;const f=await open(ALLDUE);
 for(const z of queue){await f.p.evaluate(zh=>{card=zh;flip=true;render()},z);await f.p.click('[data-rate="'+(z===queue[0]?0:2)+'"]')}
 const fd=(await S_(f.p)).dues.gram;
 const lv=d=>JSON.stringify(Object.keys(d).sort().map(z=>[z,d[z].i]));   /* the clock runs during a game (answers take time), so compare the schedule step of every word; the next-due time is step + now */
 ok('schedule parity: listen round (first word missed twice, nine right) == flashcard buttons Again / Good: the same step for all 12 words, and the missed word is due again within minutes',lv(gd)===lv(fd)&&gd[queue[0]].t-T0.getTime()<3*60000+60000*10,{game:gd[queue[0]],buttons:fd[queue[0]]});
 await g.c.close();await f.c.close()}

console.log('--- sentence builder race (the lessons\' own sentences)');
/* an order of the chips that is certainly WRONG (the old tests clicked the reverse order, which is right for a one-word or palindromic sentence, so they failed now and then, whatever the load):
   swap the first two chips whose words differ; null when the sentence has no two different words */
const wrongOrder=async p=>p.evaluate(()=>{const t=G.cs.s.t.map(x=>Array.isArray(x)?x[0]:x),n=t.length;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(t[i]!==t[j]){const o=[...Array(n).keys()];o[i]=j;o[j]=i;return o}return null});
const solve=async(p,order)=>{const n=await p.evaluate(()=>G.cs.s.t.length);const idx=order||[...Array(n).keys()];for(const i of idx)await p.click('[data-gchip="'+i+'"]')};
{const {c,p}=await open(POP);await start(p,'sent');
 const g=await p.evaluate(()=>({n:G.sp.length,note:G.snote,t:G.cs.s.t.slice(),chips:[...document.querySelectorAll('[data-gchip]')].map(x=>x.textContent.trim()),ar:document.querySelector('.gar').textContent,time:document.getElementById('gtime').textContent}));
 ok('a started lesson with enough sentences: no note; 60 s; the Arabic meaning is the prompt; chips = the sentence words, shuffled',g.n>=5&&!g.note&&g.time==='60'&&/[؀-ۿ]/.test(g.ar)&&JSON.stringify(g.chips.slice().sort())===JSON.stringify(g.t.slice().sort()),g);
 ok('the sentences come from the lessons (every sentence of the pool is a lesson sentence of this course)',await p.evaluate(()=>{const all={};sentAll().forEach(x=>all[x.s.zh]=1);return G.sp.every(s=>all[s.zh])}));
 await p.click('[data-gchip="0"]');await p.click('[data-gchip="1"]');
 ok('tapping chips builds the sentence in order and disables the used chips',await p.$$eval('#sbuilt .chipw',e=>e.length)===2&&await p.$$eval('#spool [data-gchip][disabled]',e=>e.length)===2);
 await p.click('[data-gundo]');ok('Undo takes back the last chip, which becomes available again',await p.$$eval('#sbuilt .chipw',e=>e.length)===1&&await p.$$eval('#spool [data-gchip][disabled]',e=>e.length)===1);
 await p.click('[data-gundo]');
 await solve(p);
 ok('the right order is accepted automatically: +5 points',(await GS(p)).score===5&&/صحيح/.test(await p.$eval('#gfb',e=>e.textContent)));
 await run(p,800);const n=await p.evaluate(()=>G.cs.s.t.length);
 await solve(p,(await wrongOrder(p))||[...Array(n).keys()].reverse());
 const w=await p.evaluate(()=>({wrong:G.wrong,missed:G.missedS.length,score:G.score,fb:document.getElementById('gfb').textContent}));
 ok('a wrong order shows the correct sentence, gives no points and lists the sentence to practise',w.wrong===1&&w.missed===1&&w.score===5&&/الجملة الصحيحة/.test(w.fb),w);
 await c.close()}
{const {c,p}=await open(POP);await start(p,'sent');
 ok('the hint button is disabled at first (it opens after 15 seconds)',await p.$eval('[data-ghint]',e=>e.disabled));
 await run(p,14000);ok('...still disabled at 14 s',await p.$eval('[data-ghint]',e=>e.disabled));
 await run(p,1500);ok('...enabled after 15 s',await p.$eval('[data-ghint]',e=>!e.disabled));
 await p.click('[data-ghint]');
 const h=await p.evaluate(()=>({txt:document.querySelector('[data-gchip].hint').textContent.trim(),want:G.cs.s.t[0],cnt:document.querySelectorAll('[data-gchip].hint').length}));
 ok('the hint marks the chip that comes next',h.cnt===1&&h.txt===h.want,h);
 await solve(p);ok('a sentence solved with the hint is worth +3 instead of +5',(await GS(p)).score===3);
 await run(p,800);await p.evaluate(()=>{});
 await run(p,15500);await p.click('[data-gchip="1"]');await p.click('[data-ghint]');
 ok('if the order so far is wrong the hint points at Undo',await p.$eval('[data-gundo]',e=>e.classList.contains('hint')));
 await c.close()}
{const {c,p}=await open({});await start(p,'sent');
 const note=await p.evaluate(()=>G.snote);
 ok('no lesson started (too few sentences): one Arabic line naming the lessons to open, and the whole course is used',/جمل دروسك قليلة/.test(note)&&/«الدرس السادس»/.test(note)&&await p.evaluate(()=>G.sp.length)>=5&&await p.$('.gnote')!==null);await c.close()}
{const {c,p}=await open(POP);await start(p,'sent');
 for(let k=0;k<14;k++){await solve(p);await run(p,800)}
 const sc=(await GS(p)).score,today_=await today(p);
 ok('points per round are capped at 40 (14 right sentences would give 70)',sc===40&&(await S_(p)).pts[today_]===40,{sc,pts:(await S_(p)).pts[today_]});
 await run(p,60000);ok('the round ends after 60 seconds with the summary',(await GS(p)).over&&await p.isVisible('#gfs'));
 await c.close()}
{const {c,p}=await open(ALLDUE);await start(p,'sent');
 for(let k=0;k<12&&!(await p.evaluate(()=>sentWords(G.cs.s).some(w=>DUE()[w.zh])));k++){await solve(p);await run(p,800)}
 const ws=await p.evaluate(()=>sentWords(G.cs.s).filter(w=>DUE()[w.zh]).map(w=>[w.zh,DUE()[w.zh].i]));
 await solve(p);const a1=await p.evaluate(ws=>ws.map(([z])=>DUE()[z].i),ws);
 ok('a right sentence moves the review words it contains up one step (Good)',ws.length>0&&a1.every((i,k)=>i===ws[k][1]+1),{ws,a1});
 await run(p,800);
 for(let k=0;k<12&&!(await p.evaluate(()=>sentWords(G.cs.s).some(w=>DUE()[w.zh])));k++){await solve(p);await run(p,800)}
 const ws2=await p.evaluate(()=>sentWords(G.cs.s).filter(w=>DUE()[w.zh]).map(w=>w.zh));
 await solve(p,await wrongOrder(p));
 ok('a wrong sentence sends them back to step 0 (Again)',ws2.length>0&&await p.evaluate(ws=>ws.every(z=>DUE()[z].i===0),ws2));
 await c.close()}
{const {c,p}=await open({});await start(p,'sent');
 for(let k=0;k<12&&!await wrongOrder(p);k++){await solve(p);await run(p,800)}
 await solve(p,await wrongOrder(p));await run(p,60000);
 const has=await p.evaluate(()=>sentWords(G.missedS[0]).length>0);
 ok('end screen lists the missed sentence; its button adds the sentence\'s words to the review list',(await p.$$eval('.sm1',e=>e.length))===1&&has&&await (async()=>{const before=Object.keys((await S_(p)).dues.gram).length;await p.click('[data-gadds]');return Object.keys((await S_(p)).dues.gram).length>before})());
 await c.close()}

console.log('--- daily challenge');
async function playDaily(p,wrong){
 for(let guard=0;guard<60&&!(await p.$('.gend'));guard++){
  const k=await p.evaluate(()=>G.kind),bad=!!(wrong&&wrong(k,guard));
  if(k==='read'){await p.click('[data-greveal]');await p.click(bad?'[data-gdont]':'[data-gknow]')}
  else if(k==='typepy'||k==='typear'){const z=await p.evaluate(()=>G.cur.zh);await p.fill('#gin',bad?'错':z);await p.click('[data-gcheck]');if(bad)await p.click('[data-gnext]');else await run(p,800)}
  else if(k==='sent'){const n=await p.evaluate(()=>G.cs.s.t.length);await solve(p,bad?(await wrongOrder(p))||[...Array(n).keys()].reverse():null);await run(p,bad?1700:900)}
  else await lpick(p,!bad);
 }
}
const dailyQ=p=>p.evaluate(()=>JSON.stringify(S.daily&&S.daily.gram&&S.daily.gram.q));
{const a=await open(POP,{time:T0}),b=await open(POP,{time:T0});
 await start(a.p,'daily');await start(b.p,'daily');const qa=await dailyQ(a.p),qb=await dailyQ(b.p);
 ok('seed determinism: two students with the same words on the same day get exactly the same 10 questions',qa===qb&&JSON.parse(qa).length===10,qa&&qa.slice(0,120));
 const kinds=JSON.parse(qa).map(x=>x.k);
 ok('a mix of formats (multiple choice, typing, self-rated reading, sentence, listening and tone with a voice)',new Set(kinds).size>=6&&['mcar','mcpy','typepy','typear','read','sent','listen','tone'].every(k=>kinds.includes(k)),kinds);
 await a.c.close();await b.c.close()}
{const a=await open(POP,{time:T0}),b=await open(POP,{time:new Date(T0.getTime()+86400000)});
 await start(a.p,'daily');await start(b.p,'daily');
 ok('another day gives another set',await dailyQ(a.p)!==await dailyQ(b.p));await a.c.close();await b.c.close()}
{const {c,p}=await open(POP);await start(p,'daily');const q1=await dailyQ(p);await p.click('[data-gexit]');
 await p.evaluate(()=>{Object.keys(S.dues.gram).forEach(z=>S.dues.gram[z].t=Date.now()+1e10);save()});
 await start(p,'daily');const q2=await dailyQ(p);await p.click('[data-gexit]');
 await p.reload();await p.waitForTimeout(250);await p.evaluate(()=>{crs='gram';tab='rev';render()});await start(p,'daily');const q3=await dailyQ(p);
 ok('the set is kept in zh-hub-v1 and stays the same all day, even when the words\' due status changes or the page is reloaded',q1===q2&&q2===q3);
 await c.close()}
const YEST={'2026-05-31':6,'2026-05-30':8};
const DPOP={'zh-hub-v1':{dues:dues(8,4),daily:{gram:{d:'2026-05-31',q:[],hist:YEST}}},'noor-lesson6-v1':{xp:30,known:{0:1,1:1}}};
{const {c,p}=await open(DPOP);await start(p,'daily');
 const intro=await p.$eval('.gdi',e=>e.textContent);
 const sb=await p.$$eval('.gdi .stat b',e=>e.map(x=>x.textContent));
 ok('the start screen shows today (not played), yesterday (6 of 10) and the streak of days completed (2)',/—/.test(intro)&&/6\/10/.test(intro)&&sb.join()==='—,6/10,2',sb);
 await p.click('[data-gdgo]');
 ok('it is a scored attempt (no practice flag) and every question uses the lessons\' words',await p.evaluate(()=>!G.practice&&G.queue.length===10&&G.kinds.length===10));
 for(let k=0;k<3;k++){await playOne(p)}
 ok('points are paid at the end: nothing in the daily goal while the attempt is open',(await S_(p)).pts===undefined||(await S_(p)).pts['2026-06-01']===undefined);
 await playDaily(p);
 const st=await S_(p),gs=await GS(p);
 ok('a finished scored attempt records today\'s result (10 of 10 right) and pays 2 per right answer + 10 bonus = 30 points',st.daily.gram.hist['2026-06-01']===10&&st.pts['2026-06-01']===30&&gs.score===30,{hist:st.daily.gram.hist,pts:st.pts});
 ok('end screen: today 10/10 vs yesterday 6/10 and a streak of 3 days',/10\/10/.test(await p.$eval('.gend',e=>e.textContent))&&/6\/10/.test(await p.$eval('.gend',e=>e.textContent))&&/سُجّلت نتيجة اليوم/.test(await p.$eval('.gend',e=>e.textContent))&&(await p.$$eval('.gend .stat b',e=>e.map(x=>x.textContent))).slice(3).join()==='10/10,6/10,3');
 const dues1=JSON.stringify(st.dues.gram);
 await p.click('[data-gagain]');
 ok('the second time the same day: practice only, offered without points',/تدرّب \(بدون نقاط\)/.test(await p.$eval('[data-gdgo]',e=>e.textContent))&&await p.evaluate(()=>G.practice));
 await p.click('[data-gdgo]');await playDaily(p,(k,g)=>g%3===0);
 const st2=await S_(p);
 ok('practice gives no points, changes no review schedule and does not touch the recorded score',st2.pts['2026-06-01']===30&&JSON.stringify(st2.dues.gram)===dues1&&st2.daily.gram.hist['2026-06-01']===10&&/تدريب بدون نقاط/.test(await p.$eval('.gend',e=>e.textContent)));
 await p.click('[data-gexit]');
 ok('the daily card shows today\'s result',/اليوم: 10 من 10/.test(await p.$eval('[data-gstart="daily"] .mut',e=>e.textContent)));
 await c.close()}
async function playOne(p){const k=await p.evaluate(()=>G.kind);
 if(k==='read'){await p.click('[data-greveal]');await p.click('[data-gknow]')}
 else if(k==='typepy'||k==='typear'){const z=await p.evaluate(()=>G.cur.zh);await p.fill('#gin',z);await p.click('[data-gcheck]');await run(p,800)}
 else if(k==='sent'){await solve(p);await run(p,900)}
 else await lpick(p,true)}
{const {c,p}=await open(DPOP);await start(p,'daily');await p.click('[data-gdgo]');
 await playDaily(p,(k,g)=>g<4);
 const st=await S_(p),gs=await GS(p);
 ok('wrong answers: 4 wrong, 6 right = score 6 of 10 recorded, points 2 x 6 + 10 bonus = 22; daily questions do not repeat wrong words',st.daily.gram.hist['2026-06-01']===6&&gs.score===22&&st.pts['2026-06-01']===22&&gs.qlen===10&&gs.wrong===4,{gs,pts:st.pts});
 await c.close()}
{const {c,p}=await open(POP,{voice:'none'});await start(p,'daily');const kinds=JSON.parse(await dailyQ(p)).map(x=>x.k);
 ok('on a device with no Chinese voice the set has no listening or tone question (other formats take their place)',!kinds.includes('listen')&&!kinds.includes('tone')&&kinds.length===10,kinds);await c.close()}
{const q=U.slice(0,10).map((w,i)=>({z:w.zh,k:['listen','tone'].concat(Array(8).fill('mcar'))[i]}));
 const {c,p}=await open({'zh-hub-v1':{dues:dues(8,4),daily:{gram:{d:'2026-06-01',q:q,hist:{}}}}},{voice:'none'});await start(p,'daily');await p.click('[data-gdgo]');
 const k0=await p.evaluate(()=>G.kind);await lpick(p,true);const k1=await p.evaluate(()=>G.kind);
 ok('a stored listening / tone question degrades to a multiple-choice question when this device has no Chinese voice (no empty screen, nothing spoken)',k0==='mcar'&&k1==='mcar'&&await p.evaluate(()=>window.__spoken.length)===0,[k0,k1]);await c.close()}
{const g=await open(ALLDUE),f=await open(ALLDUE);
 await start(g.p,'mem');
 const pairs=await g.p.evaluate(()=>{const seen={};G.cards.forEach((c,i)=>(seen[c.w.zh]=seen[c.w.zh]||[]).push(i));return Object.entries(seen).map(([z,ix])=>[z,ix])});
 for(const [z,[i,j]] of pairs){await g.p.click('[data-gcard="'+i+'"]');await g.p.click('[data-gcard="'+j+'"]')}
 await run(g.p,900);const gd=(await S_(g.p)).dues.gram,sm=await GS(g.p);
 for(const [z] of pairs){await f.p.evaluate(zh=>{card=zh;flip=true;render()},z);await f.p.click('[data-rate="2"]')}
 const fd=(await S_(f.p)).dues.gram;
 ok('schedule parity: a memory round without mistakes == the flashcard Good button for the 6 words',JSON.stringify(gd)===JSON.stringify(fd));
 ok('a perfect memory round is the most it can give: 6 x 3 + 3 (three stars) = 21 points',sm.score===21&&(await S_(g.p)).pts['2026-06-01']===21,sm);
 await g.c.close();await f.c.close()}

console.log('--- exit, Escape, sounds, accessibility, light and dark (new games)');
{const {c,p}=await open(POP);
 for(const m of ['mem','fall','listen','sent','daily']){
  await start(p,m);await p.keyboard.press('Escape');
  const a=await p.$('#game')===null&&await p.evaluate(()=>G===null);
  await start(p,m);await p.click('[data-gexit]');
  ok(m+': Escape closes it and the Exit button closes it (back on the review tab)',a&&await p.$('#game')===null&&await p.evaluate(()=>G===null)&&await p.$('.games')!==null)}
 await run(p,30000);ok('nothing keeps running after they were closed (no errors)',p.errs.length===0,p.errs);
 await c.close()}
{const {c,p}=await open(POP);
 await start(p,'mem');await p.click('[data-gcard="0"]');await p.click('[data-gexit]');
 await start(p,'fall');await run(p,3000);await p.click('[data-gexit]');
 await start(p,'sent');await p.click('[data-gchip="0"]');await p.click('[data-gexit]');
 ok('no sound in memory, falling words and the sentence builder (speech is used only by the listening games)',await p.evaluate(()=>window.__spoken.length)===0);
 await start(p,'listen');ok('...and the listening game speaks',await p.evaluate(()=>window.__spoken.length)>=1);await c.close()}
{const L=await open(DPOP),D=await open(DPOP,{dark:true});
 for(const m of ['mem','fall','listen','sent','daily']){await start(L.p,m);await start(D.p,m);
  ok(m+': every button is at least 44px high and wide, and nothing overflows at 360px',await L.p.$$eval('#game button',e=>e.length>0&&e.every(x=>{const r=x.getBoundingClientRect();return r.height>=44&&r.width>=44}))&&await L.p.$eval('#game',e=>e.scrollWidth<=e.clientWidth),await L.p.$$eval('#game button',e=>e.map(x=>[x.className,Math.round(x.getBoundingClientRect().width),Math.round(x.getBoundingClientRect().height)]).filter(x=>x[1]<44||x[2]<44)));
  await L.p.click('[data-gexit]');await D.p.click('[data-gexit]')}
 await start(L.p,'mem');await start(D.p,'mem');
 const bgL=await L.p.$eval('#game',e=>getComputedStyle(e).backgroundColor),bgD=await D.p.$eval('#game',e=>getComputedStyle(e).backgroundColor);
 ok('light and dark themes: the game screen takes the theme background',bgL!==bgD,[bgL,bgD]);
 await L.c.close();await D.c.close()}

console.log('--- migration: an old pre-populated state (before this phase)');
{const old={dues:Object.assign(dues(0,0),{gram:Object.assign({'好':{i:2,t:T0.getTime()+5e8}},dues(10,0).gram)}),last:3,lastCourse:'gram',days:['2024-05-01'],gbest:{ta:40}};
 const init={'zh-hub-v1':old,'noor-gram9-v1':{xp:50,known:{0:true}},'noor-gram9-v1-theme':'dark','zh-hub-v1-theme':'light','zh-ui-v1':{tone:'cb'}};
 const {c,p}=await open(init);
 const snap=()=>p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});
 const before=await snap();
 await start(p,'mem');
 const pairs=await p.evaluate(()=>{const seen={};G.cards.forEach((c,i)=>(seen[c.w.zh]=seen[c.w.zh]||[]).push(i));return Object.values(seen)});
 for(const [i,j] of pairs){await p.click('[data-gcard="'+i+'"]');await p.click('[data-gcard="'+j+'"]')}
 await run(p,900);await p.click('[data-gexit]');
 await start(p,'daily');await p.click('[data-gdgo]');await playDaily(p);
 const after=await snap(),st=JSON.parse(after['zh-hub-v1']);
 ok('the old state loads and every new game runs without errors',p.errs.length===0,p.errs);
 ok('every old field survives (a review word outside the vocabulary, last, lastCourse, days, the old best score) and the new data (gbest.mem, daily) is added inside the same key',st.dues.gram['好'].i===2&&st.last===3&&st.lastCourse==='gram'&&st.days.includes('2024-05-01')&&st.gbest.ta===40&&st.gbest.mem>0&&!!st.daily.gram&&st.daily.gram.hist['2026-06-01']!==undefined,st);
 ok('no storage key added or removed; lesson state, themes and the tone setting are byte-identical',Object.keys(after).sort().join()===Object.keys(before).sort().join()&&Object.keys(before).filter(k=>k!=='zh-hub-v1').every(k=>after[k]===before[k]),Object.keys(after).filter(k=>after[k]!==before[k]).join());
 await c.close()}
for(const c of all)await c.close().catch(()=>{});
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
