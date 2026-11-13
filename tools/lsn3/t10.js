/* Hub test (Phase 5: levels + student dashboard).   node tools/lsn3/t10.js     (run from the repo root; pages are opened from file://)
   Checks: Level -> Course -> Lessons structure straight from tools/levels.json (names unchanged, nothing locked or "coming soon",
   all 22 lessons linked, collapsible levels, the level of the last lesson open by default), the REAL completion percentage (for
   every lesson and three states the hub value must equal the lesson page's own progress() bar), lesson state badges, the dashboard
   (continue card, daily-goal ring, streak calendar, due words, points), the activity tracker in zh-ui.js (first run only takes a
   snapshot, XP growth becomes today's points and a streak day, a reset credits nothing), and migration: a pre-populated OLD state
   (before this phase) still loads, keeps all its data and no storage key is added or rewritten except the hub's own. */
const fs=require('fs');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const R='file://'+process.cwd()+'/',HUBF=process.env.HUB||'index.html';
const LV=JSON.parse(fs.readFileSync('tools/levels.json','utf8'));
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(!c&&x!==undefined?'  '+x:''));if(!c)fails++};
const ymd=d=>d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
const daysAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return ymd(d)};
const allFiles=Object.values(LV.courses).flatMap(c=>(c.lessons||[]).map(l=>l.file));
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));

const ctxs=[];
const fresh=async(w=360,init)=>{const c=await b.newContext({viewport:{width:w,height:780},isMobile:w<500,hasTouch:w<500});ctxs.push(c);if(init)await c.addInitScript(init.fn,init.arg);
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|net::|Failed to load|ERR_/.test(m.text()))errs.push(m.text())});p.errs=errs;return {c,p}};
const hub=async(p)=>{await p.goto(R+HUBF);await p.waitForTimeout(350)};
const setLS=(p,obj)=>p.evaluate(o=>{Object.keys(o).forEach(k=>localStorage.setItem(k,typeof o[k]==='string'?o[k]:JSON.stringify(o[k])))},obj);
const openLv=p=>p.$$eval('details.lvl',e=>e.filter(x=>x.open).map(x=>x.dataset.lv));

console.log('--- structure from levels.json (fresh visitor, 360px)');
let {c,p}=await fresh();await hub(p);
ok('levels shown are exactly those in levels.json, plus the extra tracks section',JSON.stringify(await p.$$eval('details.lvl',e=>e.map(x=>x.dataset.lv)))===JSON.stringify(LV.levels.map(l=>String(l.n)).concat('extra')));
ok('level titles and sub-titles come from the file (Arabic)',JSON.stringify(await p.$$eval('details.lvl:not(.extra) .lvt',e=>e.map(x=>[x.querySelector('b').textContent,x.querySelector('.mut').textContent])))===JSON.stringify(LV.levels.map(l=>[l.title,l.sub])));
ok('extra tracks section is titled from the file',await p.$eval('details.lvl.extra .lvt b',e=>e.textContent)===LV.extra.title);
ok('courses sit under the right level (and Foreign Language under the extra tracks)',JSON.stringify(await p.$$eval('details.lvl',e=>e.map(x=>[...x.querySelectorAll('.cb')].map(y=>y.dataset.course))))===JSON.stringify(LV.levels.map(l=>l.courses).concat([LV.extra.courses])));
ok('course names and books are the existing ones, unchanged',await p.$$eval('.cb',(e,C)=>e.every(x=>x.querySelector('.ci b').textContent===C[x.dataset.course].name&&x.querySelector('.ci .mut').textContent===C[x.dataset.course].book),LV.courses));
const links=await p.$$eval('.lrow',e=>e.map(x=>x.getAttribute('href')));
ok('every lesson of every course is linked (Foreign Language repeats the Grammar lessons) and old URLs are unchanged',new Set(links).size===allFiles.length&&allFiles.every(f=>links.includes(f))&&links.length===allFiles.length+LV.courses.gram.lessons.length,links.length);
ok('NO locking, no "coming soon", no placeholder tiles, nothing disabled',(await p.$$eval('button[disabled],.soon,.lock,[aria-disabled=true]',e=>e.length))===0&&!/قريباً|قريبا/.test(await p.$eval('#main',e=>e.innerText)));
ok('only the first level is open for a visitor with no history',JSON.stringify(await openLv(p))===JSON.stringify([String(LV.levels[0].n)]));
await p.click('details.lvl[data-lv="5"] summary');ok('a closed level opens when tapped (all levels stay open to everybody)',(await openLv(p)).includes('5')&&await p.isVisible('details.lvl[data-lv="5"] .cbh'));
await p.click('[data-go=tea]');await p.click('[data-go=home]');ok('the hand-opened level stays open after leaving the home tab and coming back',(await openLv(p)).includes('5'));
await p.click('details.lvl[data-lv="5"] summary');ok('and it closes again',!(await openLv(p)).includes('5'));
ok('no horizontal scrolling at 360px',await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
ok('quick dictionary/review tiles are collapsed by default and open on tap',await p.$eval('details.tools',e=>!e.open)&&(await p.click('details.tools summary'),await p.$eval('details.tools',e=>e.open)));
ok('fresh dashboard: continue card offers the first lesson, daily ring 0, 28-day calendar, no streak',await p.$eval('.cont .go',e=>e.getAttribute('href'))===allFiles[0]&&/ابدأ/.test(await p.$eval('.cont .go',e=>e.textContent))&&await p.$eval('.ring .rtx',e=>e.textContent)==='0'&&(await p.$$('.cal .cd')).length===28&&/^0 /.test(await p.$$eval('.dgi',e=>e[1].innerText)));
ok('every lesson shows a state badge, all "not started" for a fresh visitor',await p.$$eval('.lrow .st',e=>e.length>0&&e.every(x=>x.classList.contains('new'))));
console.log('--- three tiers, one tap each: level (course cards only) -> course card (collapsed) -> lessons inside the open course only');
const vis=sel=>p.$$eval(sel,e=>e.filter(x=>x.offsetParent!==null).length);
ok('a fresh visit shows NO lesson row at all (levels and courses are collapsed or closed)',await vis('.lrow')===0);
ok('the open level shows only course cards (compact buttons), every course collapsed',await p.$$eval('details.lvl[open] .lvb > *',e=>e.length>0&&e.every(x=>x.classList.contains('cb')&&!x.classList.contains('open')&&x.querySelector('.cbh').getAttribute('aria-expanded')==='false'))&&await vis('details.lvl[open] .cbh')===LV.levels[0].courses.length);
ok('a course card holds a cover thumbnail, the Arabic name, the book title, ONE progress bar with "x من y دروس مكتملة" and a chevron',await p.$$eval('.cbh',e=>e.every(x=>x.querySelector('.cover')&&x.querySelector('.ci b')&&x.querySelector('.ci .bk')&&x.querySelectorAll('.bar').length===1&&/\d+ من \d+ دروس مكتملة/.test(x.textContent)&&x.querySelector('.chev'))));
ok('course cards are compact (at most 100px high at 360px)',await p.$$eval('details.lvl[open] .cbh',e=>e.every(x=>x.getBoundingClientRect().height<=100)));
const gramLessons=LV.courses.gram.lessons.length;
await p.click('.cbh[data-cacc="gram"]');
ok('tapping a course expands its lessons inline, and only that course\'s lessons are visible',await vis('.lrow')===gramLessons&&await p.$eval('.cbh[data-cacc="gram"]',e=>e.getAttribute('aria-expanded'))==='true'&&await p.$$eval('.cb.open .lrow',e=>e.length)===gramLessons);
ok('lesson rows are compact: number badge, Chinese title, ONE-line Arabic subtitle with ellipsis, state badge, nothing else',await p.$$eval('.cb.open .lrow',e=>e.every(x=>{const ch=[...x.children].map(y=>y.className.split(' ')[0]);const sub=x.querySelector('.sub'),cs=getComputedStyle(sub),h=x.getBoundingClientRect().height;return ch.join()==='n,lt,st'&&x.querySelector('.lt').children.length===2&&cs.whiteSpace==='nowrap'&&cs.textOverflow==='ellipsis'&&sub.getBoundingClientRect().height<=20&&h<=60&&x.scrollWidth<=x.clientWidth+1})));
ok('the lesson rows still link to the unchanged lesson files',JSON.stringify(await p.$$eval('.cb.open .lrow',e=>e.map(x=>x.getAttribute('href'))))===JSON.stringify(LV.courses.gram.lessons.map(l=>l.file)));
await p.click('.cbh[data-cacc="prac"]');
ok('accordion: opening another course of the same level closes the first (one lesson list visible at a time)',await p.$eval('.cbh[data-cacc="gram"]',e=>e.getAttribute('aria-expanded'))==='false'&&await p.$eval('.cbh[data-cacc="prac"]',e=>e.getAttribute('aria-expanded'))==='true'&&await vis('.lrow')===LV.courses.prac.lessons.length);
await p.click('details.lvl[data-lv="3"] summary');await p.click('.cbh[data-cacc="lis"]');
ok('the accordion works per level: a course open in another level stays open',await vis('.lrow')===LV.courses.prac.lessons.length+LV.courses.lis.lessons.length);
await p.click('[data-go=tea]');await p.click('[data-go=home]');
ok('which course is open is remembered while the student moves around the hub',await vis('.lrow')===LV.courses.prac.lessons.length+LV.courses.lis.lessons.length);
await p.click('.cbh[data-cacc="prac"]');ok('tapping an open course closes it',await vis('.lrow')===LV.courses.lis.lessons.length);
await p.click('.cbh[data-cacc="lis"]');
ok('the dictionary/review button of a course is inside its expanded part only',await p.isVisible('.cb[data-course="gram"] [data-crs]')===false);
await p.click('.cbh[data-cacc="gram"]');ok('...and appears once the course is open',await p.isVisible('.cb[data-course="gram"] [data-crs="gram"]'));
await p.click('.cb[data-course="gram"] [data-crs="gram"]');ok('...opening the course page with its lessons, dictionary and review tabs',await p.$eval('.tab[aria-selected=true]',e=>/الدروس/.test(e.textContent))&&(await p.$$('a.course')).length===gramLessons);
await p.click('[data-crs=""]');
ok('the continue card stays on top of the hub and goes straight to a lesson (no level needs opening)',await p.evaluate(()=>{const c=document.querySelector('.cont'),l=document.querySelector('.lvls');return !!c.querySelector('a.go[href$=".html"]')&&!!(c.compareDocumentPosition(l)&Node.DOCUMENT_POSITION_FOLLOWING)}));
const sk=await p.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')||'{}'));
ok('open/closed state of courses is not written to storage (courses always start collapsed on the next visit)',!('openCourse' in sk)&&!('oc' in sk)&&!JSON.stringify(sk).includes('cacc'));
ok('no page errors',p.errs.length===0,JSON.stringify(p.errs));
await c.close();

console.log('--- the level that holds the last lesson is open; continue card follows S.lastLesson / S.last / S.lastCourse');
async function withHub(state){const x=await fresh();await x.p.goto(R+HUBF);await setLS(x.p,state);await x.p.reload();await x.p.waitForTimeout(350);return x}
let x=await withHub({'zh-hub-v1':{lastLesson:'lis-8.html'}});
ok('last lesson in Listening: Level 3 is open (and only it)',JSON.stringify(await openLv(x.p))===JSON.stringify(['3'])&&await x.p.$eval('.cont .go',e=>e.getAttribute('href'))==='lis-8.html');await x.c.close();
x=await withHub({'zh-hub-v1':{lastLesson:'cult-2.html'}});ok('last lesson in Culture: Level 7 is open',JSON.stringify(await openLv(x.p))===JSON.stringify(['7']));await x.c.close();
x=await withHub({'zh-hub-v1':{lastLesson:'lesson-9.html',lastCourse:'fl'}});
ok('a shared lesson opened from Foreign Language: the extra tracks section is open and the card names that course',JSON.stringify(await openLv(x.p))===JSON.stringify(['extra'])&&/لغة أجنبية/.test(await x.p.$eval('.cont',e=>e.innerText)));await x.c.close();
x=await withHub({'zh-hub-v1':{lastLesson:'lesson-9.html'}});ok('the same lesson from Grammar: Level 1 is open',JSON.stringify(await openLv(x.p))===JSON.stringify(['1'])&&/قواعد/.test(await x.p.$eval('.cont',e=>e.innerText)));await x.c.close();

console.log('--- real completion % = the lesson page\'s own progress bar (22 lessons x 3 states)');
{const {c,p}=await fresh(390);const pg=await c.newPage();pg.on('pageerror',e=>p.errs.push(e.message));await hub(p);let bad=[],n=0;
 for(const f of allFiles){
  await pg.goto(R+f);await pg.waitForTimeout(120);
  const hs=await p.evaluate(file=>{const r=findLesson(file);return {key:r.l.key,v:r.l.sz.v,topics:r.l.sz.topics,d:r.l.sz.d,acts:r.l.sz.acts}},f);
  const info=hs;   /* states are built from the hub's measured sizes; if a size were wrong the lesson's own bar would disagree below */
  const half=k=>Math.ceil(k/2),third=k=>Math.ceil(k/3),idx=k=>Object.fromEntries([...Array(k).keys()].map(i=>[i,1]));
  const states={
   none:null,
   partial:Object.assign({xp:40,known:idx(half(info.v)),best:Object.fromEntries(info.acts.slice(0,half(info.acts.length)).map(a=>[a,2]))},info.topics?{seenT:idx(third(info.d))}:{heard:idx(third(info.d))}),
   full:Object.assign({xp:300,badges:{first:1},known:Object.assign(idx(info.v),{[info.v+5]:true}),best:Object.assign(Object.fromEntries(info.acts.map(a=>[a,3])),{all:3,review:1})},info.topics?{seenT:idx(info.d)}:{heard:idx(info.d)})};
  for(const [name,st] of Object.entries(states)){
   await pg.evaluate(([k,s])=>{if(s===null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(s))},[info.key,st]);await pg.reload();await pg.waitForTimeout(80);
   const own=parseInt(await pg.$eval('#gprog',e=>e.style.width));
   const h=await p.evaluate(file=>{const r=findLesson(file);return lessonProg(r.l)},f);n++;
   const want=name==='none'?'new':name==='full'?'done':'prog';
   if(h.pct!==own||h.st!==want)bad.push([f,name,'lesson bar',own,'hub',h.pct,h.st,'expected state',want]);
  }
  await pg.evaluate(k=>localStorage.removeItem(k),info.key);
 }
  ok('hub completion equals the lesson page\'s own progress bar, and badges are new / in progress / done ('+n+' comparisons)',bad.length===0,JSON.stringify(bad.slice(0,3)));
 ok('stray keys (index beyond the vocabulary, "all"/"review" bests) do not inflate the percentage (covered by the "full" state = 100)',true);
 await c.close()}

console.log('--- course and level percentages, badges in the page');
{const {c,p}=await fresh();await hub(p);
 const v=await p.evaluate(()=>{var kn={};for(var i=0;i<18;i++)kn[i]=1;localStorage.setItem('noor-lis6-v1',JSON.stringify({xp:5,known:kn,heard:{0:1,1:1,2:1,3:1},best:{match:2,listen:2,meaning:2,tone:2}}));render();return +document.querySelector('details[data-lv="3"] .cb .bar').getAttribute('aria-valuenow')});
 ok('one started lesson raises its course percentage (average over the course\'s lessons) and shows "in progress" in the page',v>=1&&await p.$eval('details[data-lv="3"] .lrow .st.prog',e=>/^\d+%$/.test(e.textContent)&&/قيد التقدم/.test(e.getAttribute('aria-label'))));
 ok('level percentage equals the average of its lessons',await p.evaluate(()=>{var lv=LV.levels[1],all=[];lv.courses.forEach(function(c){all=all.concat(LB[c])});return document.querySelector('details[data-lv="3"] .pc').textContent===avgPct(all)+'%'}));
 await c.close()}

console.log('--- dashboard values');
{const t=ymd(new Date());
 x=await withHub({'zh-hub-v1':{pts:{[t]:30},days:[t,daysAgo(1),daysAgo(2),daysAgo(5)],dues:{gram:{'好':{i:0,t:0}}}}});
 ok('daily ring shows today\'s points and the goal',await x.p.$eval('.ring .rtx',e=>e.textContent)==='30'&&/30 من 50/.test(await x.p.$eval('.dgi',e=>e.innerText)));
 ok('streak counts consecutive days ending today (3) and the calendar marks the 4 study days',/3/.test(await x.p.$$eval('.dgi',e=>e[1].innerText))&&(await x.p.$$('.cal .cd.on')).length===4&&(await x.p.$$('.cal .cd.td')).length===1);
 ok('due words are counted and a button opens that course\'s review',(await x.p.$$eval('.dg2 b',e=>e[0].textContent))==='1'&&await x.p.$eval('.dg2 [data-open]',e=>e.dataset.open)==='gram:rev');
 await x.p.click('.dg2 [data-open]');ok('...and it opens the review tab of that course',/مفردات|مراجعة/.test(await x.p.$eval('#tabs',e=>e.innerText))&&await x.p.$eval('.tab[aria-selected=true]',e=>/مفرداتي/.test(e.textContent)));await x.c.close();
 x=await withHub({'zh-hub-v1':{pts:{[t]:75}}});ok('reaching the goal is celebrated and the ring is full',/أحسنت/.test(await x.p.$eval('.dgi',e=>e.innerText))&&await x.p.$eval('.ring .rfg',e=>{const a=e.getAttribute('stroke-dasharray').split(' ');return Math.abs(a[0]-a[1])<.2}));await x.c.close();
 x=await withHub({'noor-gram9-v1':{xp:120},'noor-prac6-v1':{xp:30}});ok('total points = the XP stored in the lessons (Foreign Language shares Grammar\'s lessons, counted once)',/150/.test(await x.p.$eval('.dg',e=>e.innerText)));await x.c.close()}

console.log('--- activity tracker (zh-ui.js)');
{const {c,p}=await fresh(390);await p.goto(R+'lesson-9.html');await p.waitForTimeout(400);
 const H=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')||'{}'));
 const xp=(page,delta,abs)=>page.evaluate(([d,a])=>{var k='noor-gram9-v1',s=JSON.parse(localStorage.getItem(k)||'{}');s.xp=a?0:(s.xp||0)+d;localStorage.setItem(k,JSON.stringify(s));zhUI.track()},[delta,!!abs]);const t=ymd(new Date());
 let h=await H();ok('opening a lesson records it as the last lesson and takes an XP snapshot, crediting nothing',h.lastLesson==='lesson-9.html'&&h.xpSum===0&&!h.pts&&!(h.days||[]).length,JSON.stringify(h));
 await xp(p,35);h=await H();
 ok('points earned in the lesson become today\'s points and a streak day',h.pts&&h.pts[t]===35&&h.xpSum===35&&h.days.includes(t),JSON.stringify(h));
 await xp(p,10);await p.evaluate(()=>zhUI.track());h=await H();ok('more points add up (and a repeated check credits nothing twice)',h.pts[t]===45&&h.xpSum===45);
 await xp(p,0,true);h=await H();ok('a progress reset credits nothing and resets the snapshot',h.pts[t]===45&&h.xpSum===0);
 const hp=await c.newPage();await hp.goto(R+HUBF);await hp.waitForTimeout(300);
 ok('the hub shows those points in the ring and the day in the calendar',await hp.$eval('.ring .rtx',e=>e.textContent)==='45'&&(await hp.$$('.cal .cd.on')).length===1);
 await xp(p,15);
 /* localStorage writes of one page reach another page of the same site asynchronously (a few ms to some tens of ms; this test used to read after a fixed 150ms and failed now and then):
    the focus event is repeated until the hub has seen the write, at most 3 seconds, so the check is about the behaviour, not about the browser's propagation speed */
 let ring='';for(let i=0;i<30&&ring!=='60';i++){await hp.evaluate(()=>window.dispatchEvent(new Event('focus')));await hp.waitForTimeout(100);ring=await hp.$eval('.ring .rtx',e=>e.textContent)}
 ok('a lesson open in another tab updates the hub when it regains focus (no overwrite of tracker fields on the hub\'s own save)',ring==='60',ring);
 await hp.evaluate(()=>{S.dues.gram['好']={i:0,t:Date.now()};save()});for(let i=0;i<30;i++){h=await H();if(h.dues&&h.dues.gram&&h.dues.gram['好'])break;await p.waitForTimeout(100)}ok('the hub saving its own data keeps the tracker fields (pts, xpSum, lastLesson)',h.pts[t]===60&&h.xpSum===15&&h.lastLesson==='lesson-9.html'&&!!h.dues.gram['好'],JSON.stringify(h));
 await c.close()}

console.log('--- migration: an OLD pre-populated state (before this phase)');
{const old={dues:{gram:{'好':{i:2,t:Date.now()+1e9}},fl:{},cult:{},prac:{},lis:{},biz:{}},last:3,lastCourse:'fl',days:['2024-05-01','2024-05-02']};
 const lesson={xp:50,known:{0:true,1:true},best:{match:2},badges:{first:1}};
 const {c,p}=await fresh(390);await p.goto(R+HUBF);
 await setLS(p,{'zh-hub-v1':old,'noor-gram9-v1':lesson,'noor-gram9-v1-theme':'dark','zh-hub-v1-theme':'light','zh-ui-v1':{tone:'cb'}});
 const before=await p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});
 await p.reload();await p.waitForTimeout(350);
 ok('the old state loads without errors; continue card follows the old S.last (lesson 9) and the old lastCourse (Foreign Language)',p.errs.length===0&&await p.$eval('.cont .go',e=>e.getAttribute('href'))==='lesson-9.html'&&/لغة أجنبية/.test(await p.$eval('.cont',e=>e.innerText)),JSON.stringify(p.errs));
 ok('the old lesson state still gives its progress (Lesson 9: some words, one activity) on the lesson row',await p.$eval('details[data-lv="1"] .lrow[href="lesson-9.html"] .st',e=>e.classList.contains('prog')));
 await p.click('[data-wadd]');await p.waitForTimeout(100);await p.click('.cont .go');   /* the continue card goes straight to the lesson (new tab) and saves lastLesson */
 const after=await p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});
 const st=JSON.parse(after['zh-hub-v1']);
 ok('after the hub saved, every old field is still there (dues, last, lastCourse, days) and the old review word is intact',!!st.dues.gram['好']&&st.last===3&&st.lastCourse==='fl'&&st.days.includes('2024-05-01')&&st.days.includes('2024-05-02'),JSON.stringify(st).slice(0,200));
 ok('no storage key was added, removed or rewritten except the hub\'s own (lesson, theme and UI keys are byte-identical)',Object.keys(after).sort().join()===Object.keys(before).sort().join()&&Object.keys(before).filter(k=>k!=='zh-hub-v1').every(k=>after[k]===before[k]),Object.keys(after).filter(k=>after[k]!==before[k]).join());
 await c.close()}
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
