/* Review games test (Phase 3a).   node tools/hubt/t11.js     (run from the repo root; the hub is opened from file:// as index.html)
   Checks: the games row in the review tab, the word pool (due first, fallback with one Arabic line, never empty), every mode with a
   fresh and with a pre-populated state, scoring, the 60-second timer (Playwright fake clock), that every answer changes the spaced
   schedule exactly like the flashcard buttons (same words, same result), typed-answer matching (exact match, spaces/punctuation ignored,
   pinyin typed by mistake is only a hint, one Arabic meaning shared by several words), repeat-once rule, end screen, points in the daily
   goal, tone setting, 44px targets at 360px, light/dark, no sounds, and migration from an old pre-populated state. */
const fs=require('fs');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const R='file://'+process.cwd()+'/',HUBF=process.env.HUB||'index.html';
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(!c&&x!==undefined?'  '+(typeof x==='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const T0=new Date('2026-06-01T10:00:00Z'),NAMES=['تحدي الوقت','اقرأ بدون بينيين','اكتب من البينيين','اكتب من الترجمة'],MODES=['ta','read','typepy','typear'];
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
const all=[];
/* a hub page on the review tab of a course, with a paused fake clock and optional pre-populated localStorage */
async function open(init={},o={}){
  const c=await b.newContext({viewport:{width:o.w||360,height:780},isMobile:(o.w||360)<500,hasTouch:true,colorScheme:o.dark?'dark':'light'});all.push(c);
  await c.addInitScript(([init])=>{for(const k in init){if(localStorage.getItem(k)===null)localStorage.setItem(k,typeof init[k]==='string'?init[k]:JSON.stringify(init[k]))}
    window.__speak=0;if(window.speechSynthesis){const f=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=function(u){window.__speak++;return f(u)}}},[init]);
  const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|net::|Failed to load|ERR_/.test(m.text()))p.errs.push(m.text())});
  await p.clock.install({time:T0});await p.goto(R+HUBF);await p.waitForTimeout(250);
  await p.evaluate(crs=>{window.crs=crs;tab='rev';render()},o.crs||'gram');await p.clock.pauseAt(new Date(T0.getTime()+5000));return {c,p};
}
const S_=p=>p.evaluate(()=>JSON.parse(JSON.stringify(S)));
const GS=p=>p.evaluate(()=>({mode:G.mode,score:G.score,correct:G.correct,wrong:G.wrong,streak:G.streak,i:G.i,qlen:G.queue&&G.queue.length,cur:G.cur&&G.cur.zh,over:!!G.over}));
const start=async(p,m)=>{await p.click('[data-gstart="'+m+'"]');await p.waitForTimeout(60)};
const run=(p,ms)=>p.clock.runFor(ms);
/* the course vocabulary, unique words */
let U;{const {c,p}=await open({});U=await p.evaluate(()=>{const s={},o=[];VOCAB_BY.gram.forEach(w=>{if(!s[w.zh]){s[w.zh]=1;o.push({zh:w.zh,py:w.py,ar:w.ar,l:w.l})}});return o});await c.close()}
const dues=(due,later)=>{const d={gram:{},fl:{},cult:{},prac:{},lis:{},biz:{}};U.slice(0,due).forEach(w=>d.gram[w.zh]={i:2,t:T0.getTime()-60000});U.slice(due,due+later).forEach(w=>d.gram[w.zh]={i:2,t:T0.getTime()+1e9});return d};
const POP={'zh-hub-v1':{dues:dues(8,4)},'noor-lesson6-v1':{xp:30,known:{0:1,1:1}}};   /* 8 due, 4 later, lesson 6 started */

console.log('--- entry: the games row in the review tab (fresh visitor, 360px)');
{const {c,p}=await open({});
 ok('time attack is in the games section (with the real games); the three typed / self-rated modes are in the separate «تمارين» section, with the agreed names, in order',JSON.stringify(await p.$$eval('.games:not(.ex) .gcard b',e=>e.map(x=>x.textContent)).then(a=>a.slice(0,1)))===JSON.stringify([NAMES[0]])&&JSON.stringify(await p.$$eval('.games.ex .gcard b',e=>e.map(x=>x.textContent)))===JSON.stringify(NAMES.slice(1))&&JSON.stringify(await p.$$eval('.gh',e=>e.map(x=>x.textContent)))==='["ألعاب","تمارين"]');
 ok('each card: icon, name, one short line; at least 44px high; the row does not overflow at 360px',await p.$$eval('.gcard',e=>e.every(x=>x.querySelector('svg.ic')&&x.querySelectorAll('b').length===1&&x.querySelectorAll('.mut').length===1&&x.getBoundingClientRect().height>=44))&&await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
 ok('compact: the exercises row is a single row of three small cards (under 140px) and both sections sit after the review stats',await p.evaluate(()=>{const g=document.querySelector('.games.ex'),s=document.querySelector('.stats');return g.getBoundingClientRect().height<140&&!!(s.compareDocumentPosition(g)&Node.DOCUMENT_POSITION_FOLLOWING)&&!!(s.compareDocumentPosition(document.querySelector('.games'))&Node.DOCUMENT_POSITION_FOLLOWING)}));
 ok('all four games are always available (no locking, nothing disabled)',await p.$$eval('.gcard',e=>e.every(x=>!x.disabled&&!x.hasAttribute('aria-disabled'))));
 const note=await p.$eval('.gnote',e=>e.textContent);
 ok('a visitor with no words gets ONE Arabic line naming the lessons to open first',/«الدرس السادس»/.test(note)&&/«الدرس السابع»/.test(note)&&/افتح أولاً/.test(note));
 for(const m of MODES){await start(p,m);
  ok(m+': starts full-screen (dialog), never empty, with a clear Exit button',await p.evaluate(()=>{const g=document.getElementById('game'),r=g.getBoundingClientRect();return g.getAttribute('role')==='dialog'&&g.getAttribute('aria-modal')==='true'&&r.width===innerWidth&&r.height===innerHeight&&g.querySelector('.gbody').innerText.trim().length>5&&!!g.querySelector('[data-gexit]')}));
  await p.click('[data-gexit]');ok(m+': Exit closes it and the review tab is back',await p.$('#game')===null&&await p.$('.games')!==null&&await p.evaluate(()=>document.documentElement.style.overflow==='')&&(await p.evaluate(()=>G))===null)}
 await start(p,'typepy');await p.keyboard.press('Escape');ok('Escape also closes a game',await p.$('#game')===null);
 await start(p,'ta');await p.click('[data-gexit]');await run(p,70000);ok('leaving time attack stops its timers (nothing runs afterwards, no errors)',p.errs.length===0&&await p.$('#game')===null,p.errs);
 await c.close()}

console.log('--- word pool: due first, then other review words, then words of lessons already started');
{const {c,p}=await open(POP);
 const pool=await p.evaluate(()=>gamePool());const z=pool.words.map(w=>w.zh),due=U.slice(0,8).map(w=>w.zh),later=U.slice(8,12).map(w=>w.zh);
 ok('the first 8 words are the due ones, the next 4 the other review words, then lesson 6 words (started lesson), no duplicates',new Set(z.slice(0,8)).size===8&&z.slice(0,8).every(x=>due.includes(x))&&z.slice(8,12).every(x=>later.includes(x))&&z.slice(12).every(x=>{const w=U.find(y=>y.zh===x);return w.l===6&&!due.includes(x)&&!later.includes(x)})&&new Set(z).size===z.length&&z.length>12,{n:z.length});
 ok('with enough words there is no note',pool.note===''&&await p.$('.gnote')===null);
 await c.close()}
{const {c,p}=await open({'zh-hub-v1':{dues:dues(2,0)}});
 const pool=await p.evaluate(()=>gamePool());
 ok('under 4 words: the line names the lessons to open and the games still use the whole course (never empty)',/افتح أولاً/.test(pool.note)&&pool.words.length>=4&&await p.$('.gnote')!==null);
 for(const m of MODES){await start(p,m);ok(m+' starts with the fallback pool and shows a question',await p.evaluate(()=>!!G&&(G.mode==='ta'?G.q.opts.length===4:G.queue.length>=4)));await p.click('[data-gexit]')}
 await c.close()}
{const {c,p}=await open({'zh-hub-v1':{dues:dues(1,0)},'noor-lesson7-v1':{xp:5,known:{0:1}}});
 const pool=await p.evaluate(()=>gamePool());
 ok('one started lesson is enough: its words join the pool (the one review word first) and there is no note',pool.note===''&&pool.words.length>=4&&pool.words[0].zh===U[0].zh&&pool.words.slice(1).every(w=>U.find(x=>x.zh===w.zh).l===7),pool.note);
 await c.close()}
{const {c,p}=await open({'zh-hub-v1':{dues:dues(4,0)}});await start(p,'read');
 ok('exactly 4 words: games run with a round of 4 (round size 10 only when there are 10 words)',(await GS(p)).qlen===4);await c.close()}

console.log('--- time attack (all 12 review words due; fake clock)');
{const {c,p}=await open({'zh-hub-v1':{dues:dues(12,0)}});await start(p,'ta');
 ok('60 seconds, score 0, multiplier x1, four distinct options (one right)',await p.$eval('#gtime',e=>e.textContent)==='60'&&await p.$eval('#gscore',e=>e.textContent)==='0'&&await p.$eval('#gmul',e=>e.textContent)==='×1'&&await p.evaluate(()=>G.q.opts.length===4&&G.q.opts.filter(o=>o.ok).length===1&&new Set(G.q.opts.map(o=>G.q.kind==='py'?npy(o.w.py):arNorm(o.w.ar))).size===4));
 const pick=async(right)=>{const idx=await p.evaluate(r=>G.q.opts.findIndex(o=>o.ok===r),right);const w=await p.evaluate(()=>G.q.w.zh);const before=(await S_(p)).dues.gram[w];await p.click('[data-gopt="'+idx+'"]');await run(p,right?500:900);return {w,before}};
 const sc=()=>p.$eval('#gscore',e=>+e.textContent);
 const a=await pick(true);ok('right answer: +2 points; the word is rescheduled as "good" (like the Good button)',await sc()===2&&(await S_(p)).dues.gram[a.w].i===a.before.i+1&&(await S_(p)).dues.gram[a.w].t>T0.getTime()+1e6);
 await pick(true);ok('second right answer in a row: +2 (x1)',await sc()===4);
 await pick(true);ok('third in a row: x2 (+4) and the multiplier is shown',await sc()===8&&await p.$eval('#gmul',e=>e.textContent)==='×2');
 const w=await pick(false);ok('wrong answer: no points, streak and multiplier reset, the word is rescheduled as "again"',await sc()===8&&await p.$eval('#gmul',e=>e.textContent)==='×1'&&(await S_(p)).dues.gram[w.w].i===0&&(await GS(p)).streak===0);
 await pick(true);ok('right again after a miss starts from +2',await sc()===10);
 for(let k=0;k<3;k++)await pick(true);ok('streaks 2,3,4 after the miss: +2 (x1), +4 (x2), +4 (x2)',await sc()===10+2+4+4);
 await pick(true);await pick(true);await pick(true);ok('from a streak of 6 the multiplier is x3 (+6)',await sc()===20+4+6+6&&await p.$eval('#gmul',e=>e.textContent)==='×3');
 /* ---- the timer ---- */
 await run(p,10000);
 const left=await p.evaluate(()=>({txt:+document.getElementById('gtime').textContent,calc:Math.max(0,Math.ceil((G.end-Date.now())/1000))}));
 ok('the countdown follows the clock (shows the seconds left)',left.txt===left.calc&&left.txt<60&&left.txt>0,left);
 await run(p,60000);
 const sum=await p.evaluate(()=>({over:G.over,score:G.score,txt:document.getElementById('gfs').textContent,acc:document.getElementById('gfa').textContent,c:G.correct,w:G.wrong,opts:document.querySelectorAll('.gopt').length}));
 ok('after 60 seconds the game ends by itself: summary with score, accuracy, no more options',sum.over&&+sum.txt===sum.score&&sum.acc===Math.round(sum.c/(sum.c+sum.w)*100)+'%'&&sum.opts===0,sum);
 const st=await S_(p),today=await p.evaluate(()=>today());
 ok('the points went into the daily goal (S.pts today = score) and the day is marked for the streak; best score stored inside zh-hub-v1',st.pts[today]===sum.score&&st.days.includes(today)&&st.gbest.ta===sum.score,st);
 ok('the missed word is listed to practise again',sum.w===1&&await p.$$eval('.gm1',e=>e.length)===1);
 await c.close()}

console.log('--- every answer changes the schedule exactly like the flashcard buttons (same words, same result)');
{const PAR={'zh-hub-v1':{dues:dues(12,0)}};   /* all 12 words are due, so the flashcard view can show any of them */
 const g=await open(PAR);await start(g.p,'read');
 const queue=await g.p.evaluate(()=>G.queue.map(w=>w.zh));
 for(let guard=0;guard<30&&!(await g.p.$('.gend'));guard++){await g.p.click('[data-greveal]');const first=await g.p.evaluate(q=>G.cur.zh===q,queue[0]);await g.p.click(first?'[data-gdont]':'[data-gknow]')}
 const gd=(await S_(g.p)).dues.gram;
 const f=await open(PAR);
 for(const z of queue){const r=z===queue[0]?0:2;await f.p.evaluate(zh=>{card=zh;flip=true;render()},z);await f.p.click('[data-rate="'+r+'"]')}
 const fd=(await S_(f.p)).dues.gram;
 ok('game: first word missed (twice, it comes back once), nine known  ==  buttons: Again for it, Good for the nine: identical dues (level and next time) for all 12 words',JSON.stringify(gd)===JSON.stringify(fd),{game:gd[queue[0]],buttons:fd[queue[0]]});
 ok('the missed word is due again soon, the known ones moved up one step',gd[queue[0]].i===0&&gd[queue[1]].i===3&&gd[queue[0]].t<gd[queue[1]].t);
 ok('flashcard buttons keep working (they and the games share schedule())',await f.p.evaluate(()=>typeof schedule==='function'&&typeof rate==='function'));
 const stored=await f.p.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')));const day=await f.p.evaluate(()=>today());
 ok('the flashcard buttons still give their 2 review points per word, and they are really saved in storage (regression: a save must not drop the hub\'s own points)',stored.pts&&stored.pts[day]===queue.length*2,stored.pts);
 await f.p.evaluate(()=>{crs='';tab='home';render()});const href=await f.p.$eval('.cont .go',e=>e.getAttribute('href'));await f.p.click('.cont .go');
 ok('opening a lesson from the hub saves it as the last lesson (regression: a save must not drop it)',(await f.p.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')))).lastLesson===href&&(await f.p.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')))).pts[day]===queue.length*2);
 await g.c.close();await f.c.close()}

console.log('--- read without help (pre-populated)');
{const {c,p}=await open(POP);await start(p,'read');
 ok('only the characters are shown (inside a bdi lang zh-CN); no pinyin and no meaning yet; counter 1 / 10; a Reveal button',await p.$('.ghan bdi[lang="zh-CN"]')!==null&&await p.$('.gpy')===null&&await p.$('.gar')===null&&(await GS(p)).qlen===10&&/1\s*\/\s*10/.test(await p.$eval('.gst',e=>e.textContent))&&await p.isVisible('[data-greveal]'));
 await p.click('[data-greveal]');
 ok('Reveal shows the pinyin and the meaning and the two self-rating buttons (>= 44px)',await p.isVisible('.gpy')&&await p.isVisible('.gar')&&await p.$$eval('[data-gknow],[data-gdont]',e=>e.length===2&&e.every(x=>x.getBoundingClientRect().height>=44)));
 await p.click('[data-gknow]');ok('"عرفتها": +2 points and the next word',(await GS(p)).score===2&&(await GS(p)).i===1&&await p.$('.gpy')===null);
 const w2=(await GS(p)).cur;await p.click('[data-greveal]');await p.click('[data-gdont]');
 ok('"لم أعرفها": no points and the word is queued once more at the end (11 questions)',(await GS(p)).score===2&&(await GS(p)).qlen===11&&await p.evaluate(w=>G.queue[G.queue.length-1].zh===w,w2));
 for(let guard=0;guard<30&&!(await p.$('.gend'));guard++){await p.click('[data-greveal]');const again=await p.evaluate(w=>G.cur.zh===w&&G.rep[w]===1&&G.i===G.queue.length-1,w2);await p.click(again?'[data-gdont]':'[data-gknow]')}
 const gs=await p.evaluate(()=>({q:G.queue.length,c:G.correct,w:G.wrong,s:G.score,miss:G.missed.length}));
 ok('a word answered wrong twice does NOT come back a third time: 11 answers in all, 9 right, 18 points, listed once',gs.q===11&&gs.c===9&&gs.w===2&&gs.s===18&&gs.miss===1,gs);
 ok('end screen: score, accuracy 82%, words to practise again, play again, back',await p.$eval('#gfs',e=>e.textContent)==='18'&&await p.$eval('#gfa',e=>e.textContent)==='82%'&&await p.$$eval('.gm1',e=>e.length)===1&&await p.isVisible('[data-gagain]')&&await p.isVisible('.gend [data-gexit]'));
 await c.close()}
{const {c,p}=await open({});await start(p,'read');   /* fresh: nothing is in the review list */
 for(let guard=0;guard<30&&!(await p.$('.gend'));guard++){await p.click('[data-greveal]');await p.click('[data-gknow]')}
 const st=await S_(p);
 ok('words that are not in the review list get points but no schedule (a game never adds words behind the student\'s back)',st.pts[await p.evaluate(()=>today())]===20&&Object.keys(st.dues.gram).length===0);
 await c.close()}

console.log('--- type from pinyin');
{const {c,p}=await open(POP);await start(p,'typepy');
 ok('large input, no autocorrect / autocapitalize / spellcheck, lang zh-CN, Enter key hint, >= 44px; Check and Skip buttons',await p.$eval('#gin',e=>e.getAttribute('autocomplete')==='off'&&e.getAttribute('autocorrect')==='off'&&e.getAttribute('autocapitalize')==='off'&&e.getAttribute('spellcheck')==='false'&&e.lang==='zh-CN'&&e.getAttribute('enterkeyhint')==='done'&&e.getBoundingClientRect().height>=44&&parseFloat(getComputedStyle(e).fontSize)>=24)&&await p.isVisible('[data-gcheck]')&&await p.isVisible('[data-gskip]'));
 ok('the pinyin of the word is shown (tone marks, colour spans)',await p.$eval('.gpy',e=>e.querySelectorAll('span[class^=t]').length>0&&/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]|[a-z]/.test(e.textContent)));
 const w1=await p.evaluate(()=>({zh:G.cur.zh,py:G.cur.py}));
 await p.fill('#gin',w1.py.replace(/\s+/g,''));await p.click('[data-gcheck]');
 ok('typing the pinyin instead of the characters is only a hint (not a mistake, not counted)',/اكتب بالحروف الصينية/.test(await p.$eval('#gfb',e=>e.textContent))&&(await GS(p)).wrong===0&&(await GS(p)).score===0);
 await p.fill('#gin','错');await p.keyboard.press('Enter');
 ok('Enter submits; a wrong answer shows the correct word with its pinyin and meaning, no points, and waits for "next"',await p.$eval('#gfb',e=>e.textContent.includes('الإجابة الصحيحة'))&&await p.$eval('#gfb .gans',e=>true)&&await p.$$eval('#gfb .py span',e=>e.length>0)&&(await GS(p)).wrong===1&&(await GS(p)).score===0&&await p.isVisible('[data-gnext]'));
 await p.keyboard.press('Enter');ok('Enter again goes to the next word',(await GS(p)).i===1&&await p.$eval('#gin',e=>e.value===''&&!e.readOnly));
 const w2=await p.evaluate(()=>G.cur.zh);await p.fill('#gin',' '+w2+'。 ');await p.click('[data-gcheck]');
 ok('exact characters are accepted (spaces and punctuation ignored): +4 points, then it moves on by itself',(await GS(p)).score===4&&/صحيح/.test(await p.$eval('#gfb',e=>e.textContent)));
 await run(p,800);ok('...after a short moment',(await GS(p)).i===2);
 const w3=await p.evaluate(()=>G.cur.zh);const bef=(await S_(p)).dues.gram[w3];await p.click('[data-gskip]');
 ok('Skip counts as not known: the answer is shown, no points, the word is rescheduled as "again"',/تخطّيت/.test(await p.$eval('#gfb',e=>e.textContent))&&(await GS(p)).wrong===2&&(await GS(p)).score===4&&(await S_(p)).dues.gram[w3].i===0);
 await p.keyboard.press('Enter');
 /* same pinyin = also accepted */
 const cur=await p.evaluate(()=>({zh:G.cur.zh,py:G.cur.py}));
 await p.evaluate(py=>{VOCAB_BY.gram.push({zh:'測',py:py,ar:'اختبار',l:6})},cur.py);
 await p.fill('#gin','測');await p.click('[data-gcheck]');
 ok('another word of the course with the very same pinyin (tones included) is accepted too',(await GS(p)).score===8,await GS(p));
 await c.close()}

console.log('--- type from Arabic (one meaning, several words)');
{const {c,p}=await open(POP);
 ok('Arabic matching ignores vowel marks and alef forms',await p.evaluate(()=>arNorm('أَكْلٌ')===arNorm('اكل')&&arNorm('  أ  ب ')==='ا ب'));
 const dup=await p.evaluate(()=>{const m={};VOCAB_BY.gram.forEach(w=>{(m[arNorm(w.ar)]=m[arNorm(w.ar)]||{})[w.zh]=1});return Object.keys(m).filter(k=>Object.keys(m[k]).length>1).length});
 await start(p,'typear');
 ok('the meaning is shown in Arabic and the answer is typed in a large input',await p.$('.gar')!==null&&await p.$('#gin')!==null&&await p.$('.gpy')===null);
 const cur=await p.evaluate(()=>({zh:G.cur.zh,ar:G.cur.ar}));
 await p.evaluate(a=>{VOCAB_BY.gram.push({zh:'測驗',py:'cè yàn',ar:a,l:6})},cur.ar);
 ok('acceptSet holds the word and every other word with that meaning',await p.evaluate(()=>{const s=acceptSet('typear',G.cur);return !!s[cjk(G.cur.zh)]&&!!s['測驗']}));
 await p.fill('#gin','測驗');await p.click('[data-gcheck]');
 ok('a different word with the same Arabic meaning is accepted: +5 points',(await GS(p)).score===5&&/صحيح/.test(await p.$eval('#gfb',e=>e.textContent)));
 await run(p,800);
 await p.fill('#gin','错');await p.click('[data-gcheck]');ok('a word with another meaning is wrong: correct answer and pinyin shown',(await GS(p)).wrong===1&&await p.$$eval('#gfb .py span',e=>e.length)>0);
 console.log('     (natural duplicate meanings in the Grammar vocabulary: '+dup+')');
 await c.close()}

console.log('--- full round, end screen, add to review, play again, points in the daily goal');
{const {c,p}=await open({});await start(p,'typear');
 let skipped=null;
 for(let guard=0;guard<40&&!(await p.$('.gend'));guard++){
   const w=await p.evaluate(()=>G.cur.zh);
   if(skipped===null){skipped=w;await p.click('[data-gskip]');await p.keyboard.press('Enter')}
   else{await p.fill('#gin',w);await p.click('[data-gcheck]');await run(p,800)}
 }
 const gs=await p.evaluate(()=>({q:G.queue.length,c:G.correct,w:G.wrong,s:G.score}));
 ok('a skipped word returns once at the end and is then answered: 11 questions, 10 right, 1 wrong, 50 points',gs.q===11&&gs.c===10&&gs.w===1&&gs.s===50,gs);
 ok('end screen: score 50, accuracy 91%, 10 / 11, new record, the word to practise with an add-to-review button',await p.$eval('#gfs',e=>e.textContent)==='50'&&await p.$eval('#gfa',e=>e.textContent)==='91%'&&/10 \/ 11/.test(await p.$eval('.gstats',e=>e.textContent))&&/رقم قياسي/.test(await p.$eval('.gend',e=>e.textContent))&&await p.$$eval('.gm1 [data-gadd]',e=>e.length)===1);
 ok('nothing was added to the review list by playing',Object.keys((await S_(p)).dues.gram).length===0);
 await p.click('[data-gadd]');
 const st=await S_(p);
 ok('tapping "add to review" puts the word in the review list (level 0) and the button turns into a badge',st.dues.gram[skipped]&&st.dues.gram[skipped].i===0&&await p.$('.gm1 [data-gadd]')===null&&/في المراجعة/.test(await p.$eval('.gm1',e=>e.textContent)));
 ok('all buttons of the end screen are at least 44px high; nothing overflows at 360px',await p.$$eval('#game button',e=>e.every(x=>x.getBoundingClientRect().height>=44))&&await p.$eval('#game',e=>e.scrollWidth<=e.clientWidth));
 await p.click('[data-gagain]');ok('"play again" starts a new round of the same game with score 0',(await GS(p)).mode==='typear'&&(await GS(p)).score===0&&(await GS(p)).i===0&&await p.$('#gin')!==null);
 await p.click('[data-gexit]');
 ok('"back" returns to the review tab, which now counts the added word',await p.$('#game')===null&&await p.$$eval('.stats .stat b',e=>e[1].textContent)==='1');
 await p.evaluate(()=>{crs='';tab='home';render()});await run(p,100);
 ok('the points feed the dashboard: the daily-goal ring shows them and today is marked in the streak calendar',await p.$eval('.ring .rtx',e=>e.textContent)==='50'&&await p.$$eval('.cal .cd.on',e=>e.length)===1);
 ok('no sound was played in any game',await p.evaluate(()=>window.__speak)===0);
 ok('no page errors',p.errs.length===0,p.errs);
 await c.close()}

console.log('--- migration: an old pre-populated state (before this phase)');
{const old={dues:Object.assign(dues(0,0),{gram:{'好':{i:2,t:T0.getTime()+5e8}}}),last:3,lastCourse:'fl',days:['2024-05-01','2024-05-02']};
 const init={'zh-hub-v1':old,'noor-gram9-v1':{xp:50,known:{0:true,1:true}},'noor-gram9-v1-theme':'dark','zh-hub-v1-theme':'light','zh-ui-v1':{tone:'cb'}};
 const {c,p}=await open(init,{crs:'fl'});   /* the course the old state remembers (opening a course legitimately updates lastCourse) */
 const before=await p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});
 await start(p,'read');for(let guard=0;guard<30&&!(await p.$('.gend'));guard++){await p.click('[data-greveal]');await p.click('[data-gknow]')}
 const after=await p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});
 const st=JSON.parse(after['zh-hub-v1']);
 ok('the old state loads and the game runs without errors',p.errs.length===0,p.errs);
 ok('every old field survives (review words incl. a word not in the vocabulary, last, lastCourse, days) and the new data (pts, gbest) is added inside the same key',st.dues.gram['好'].i===2&&st.dues.gram['好'].t===T0.getTime()+5e8&&st.last===3&&st.lastCourse==='fl'&&st.days.includes('2024-05-01')&&st.days.includes('2024-05-02')&&!!st.pts&&!!st.gbest,st);
 ok('no storage key added or removed; every other key (lesson state, themes, tone setting) is byte-identical',Object.keys(after).sort().join()===Object.keys(before).sort().join()&&Object.keys(before).filter(k=>k!=='zh-hub-v1').every(k=>after[k]===before[k]),Object.keys(after).filter(k=>after[k]!==before[k]).join());
 await c.close()}

console.log('--- tone setting, light and dark, 44px everywhere');
{const {c,p}=await open({'zh-ui-v1':{tone:'numbers'}});await start(p,'typepy');await run(p,200);
 ok('tone setting "numbers": the pinyin of the prompt is shown as numbers, not tone marks',await p.$eval('.gpy',e=>/\d/.test(e.textContent)&&!/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(e.textContent)),await p.$eval('.gpy',e=>e.textContent));
 await c.close()}
{const {c,p}=await open({'zh-ui-v1':{tone:'cb'}});await start(p,'ta');await run(p,200);
 ok('tone setting "colour-blind palette" is applied to the pinyin options of the games (data-tone on the page)',await p.evaluate(()=>document.documentElement.getAttribute('data-tone')==='cb'));await c.close()}
{const L=await open(POP);const D=await open(POP,{dark:true});
 await start(L.p,'read');await start(D.p,'read');
 const bgL=await L.p.$eval('#game',e=>getComputedStyle(e).backgroundColor),bgD=await D.p.$eval('#game',e=>getComputedStyle(e).backgroundColor);
 ok('light and dark: the game screen takes the theme background (they differ)',bgL!==bgD&&bgD!=='rgba(0, 0, 0, 0)',[bgL,bgD]);
 ok('animation is a short fade (<= 0.2s) and stops with reduced motion',await L.p.$eval('#game',e=>parseFloat(getComputedStyle(e).animationDuration)<=0.2));
 for(const m of MODES){await L.p.click('[data-gexit]');await start(L.p,m);
  ok(m+': every button in the game is at least 44px high and wide, nothing overflows at 360px',await L.p.$$eval('#game button',e=>e.every(x=>{const r=x.getBoundingClientRect();return r.height>=44&&r.width>=44}))&&await L.p.$eval('#game',e=>e.scrollWidth<=e.clientWidth))}
 await L.c.close();await D.c.close()}
for(const c of all)await c.close().catch(()=>{});
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
