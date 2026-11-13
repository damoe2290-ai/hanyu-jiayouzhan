/* Navigation test: logo -> hub home; back arrow -> the course's lesson list; lessons shared by Grammar and Foreign Language
   send the back arrow to the course the student opened last (default Grammar).   PAGE_PREFIX= node tools/lsn3/t8.js  (repo root) */
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright']){try{({chromium}=require(m));break}catch(e){}}
const fs=require('fs');const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const PFX=process.env.PAGE_PREFIX===undefined?'w-':process.env.PAGE_PREFIX;const R='file://'+process.cwd()+'/'+PFX;
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(x?'  '+x:''));if(!c)fails++};
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
/* the first-visit welcome of the hub (Phase 6c) would sit on top of a fresh hub: these older tests are about other things, so every context auto-skips it (t16.js and hubt/t17.js test the welcome itself) */
{const nw=()=>{document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{const x=document.querySelector('#wel .wl-act [data-wl=skip]');if(x)x.click()},0))};const nc=b.newContext.bind(b),np=b.newPage.bind(b);
 b.newContext=async o=>{const c=await nc(o);await c.addInitScript(nw);return c};b.newPage=async o=>{const c=await nc(o);await c.addInitScript(nw);return c.newPage()}}

const fresh=async()=>{const c=await b.newContext({viewport:{width:390,height:844}});return {c,p:await c.newPage()}};
const back=p=>p.$eval('.zh-back',e=>e.getAttribute('href'));
console.log('--- every course: logo and back arrow');
for(const [pg,course] of [['lesson-9','gram'],['prac-7','prac'],['lis-8','lis'],['biz-5','biz'],['cult-3','cult']]){
  const {c,p}=await fresh();await p.goto(R+pg+'.html');await p.waitForTimeout(250);
  await p.click('a.seal');await p.waitForTimeout(300);const home=p.url().replace(R,'');
  await p.goto(R+pg+'.html');await p.click('.zh-back');await p.waitForTimeout(400);const bk=p.url().replace(R,'');
  const lists=await p.$$eval('a.course',e=>e.map(x=>x.getAttribute('href')));
  ok(pg+': logo -> hub home, back -> this course\'s list',home==='index.html'&&bk==='index.html#'+course&&lists.indexOf(pg+'.html')>=0,home+' | '+bk);await c.close();}
console.log('--- lessons shared by Grammar and Foreign Language');
let {c,p}=await fresh();await p.goto(R+'lesson-9.html');await p.waitForTimeout(250);
ok('nothing remembered yet: back arrow defaults to Grammar',await back(p)==='index.html#gram');await c.close();
for(const [from,expect] of [['fl','index.html#fl'],['gram','index.html#gram']]){
  ({c,p}=await fresh());await p.goto(R+'index.html#'+from);await p.waitForTimeout(400);
  const [np]=await Promise.all([c.waitForEvent('page'),p.click('a.course[href="lesson-9.html"]')]);await np.waitForLoadState();await np.waitForTimeout(300);
  const h=await back(np);await np.click('.zh-back');await np.waitForTimeout(400);
  ok('opened from '+from+': back arrow -> '+expect+' and the hub shows that course',h===expect&&np.url().replace(R,'')===expect&&(await np.$$eval('a.course',e=>e.map(x=>x.getAttribute('href')))).indexOf('lesson-9.html')>=0,h);
  const st=await np.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')));
  ok('  remembered inside the existing hub key (lastCourse); review data kept',st.lastCourse===from&&!!st.dues&&Object.keys(await np.evaluate(()=>localStorage)).every(k=>k==='zh-hub-v1'||k.indexOf('noor-')===0||k.indexOf('zh-')===0));
  await c.close();}
console.log('--- the existing "continue" chip of the hub is not disturbed (S.last = index of the last Grammar lesson)');
({c,p}=await fresh());await p.goto(R+'index.html#gram');await p.waitForTimeout(400);
const [np3]=await Promise.all([c.waitForEvent('page'),p.click('a.course[href="lesson-9.html"]')]);await np3.close();await p.waitForTimeout(200);
const st3=await p.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')));
ok('opening lesson 9 stores S.last = 3 (lesson index) and lastCourse = gram',st3.last===3&&st3.lastCourse==='gram',JSON.stringify([st3.last,st3.lastCourse]));
await p.click('[data-go=home]').catch(()=>{});await p.goto(R+'index.html');await p.waitForTimeout(400);
ok('home "continue" chip still points at lesson 9',(await p.evaluate(()=>document.body.innerText)).indexOf('الدرس التاسع')>=0);await c.close();
({c,p}=await fresh());await p.goto(R+'index.html#fl');await p.waitForTimeout(300);
await p.click('[data-crs=""]');if(!(await p.isVisible('.cbh[data-cacc="prac"]')))await p.click('details.lvl:has([data-course="prac"]) summary');   /* levels are collapsible and a course card must be tapped before its lessons and buttons show: do it like a student */
if(!(await p.isVisible('[data-crs="prac"]')))await p.click('.cbh[data-cacc="prac"]');
await p.click('[data-crs="prac"]');await p.waitForTimeout(300);   // the hub reads the URL hash only at load: use its own buttons
await p.goto(R+'lesson-9.html');await p.waitForTimeout(250);
ok('last course was Reading (not Foreign Language): lesson 9 still goes back to Grammar',await back(p)==='index.html#gram');
await p.goto(R+'prac-7.html');ok('a Reading lesson always goes back to Reading, whatever was remembered',await back(p)==='index.html#prac');await c.close();
({c,p}=await fresh());await p.goto(R+'index.html#fl');await p.waitForTimeout(300);
const [np2]=await Promise.all([c.waitForEvent('page'),p.click('a.course[href="lesson-9.html"]')]);await np2.waitForLoadState();await np2.waitForTimeout(300);
await np2.click('#fc');await np2.click('[data-act=again]');
const st2=await np2.evaluate(()=>JSON.parse(localStorage.getItem('zh-hub-v1')));
ok('a lesson that writes review data keeps lastCourse and the continue index (both courses get the word)',st2.lastCourse==='fl'&&st2.last===3,JSON.stringify([st2.lastCourse,st2.last,Object.keys(st2.dues.gram),Object.keys(st2.dues.fl)]));
ok('  review word is in both Grammar and Foreign Language lists',Object.keys(st2.dues.gram).indexOf('每天')>=0&&Object.keys(st2.dues.fl).indexOf('每天')>=0);await c.close();
({c,p}=await fresh());await p.goto(R+'index.html#fl');await p.waitForTimeout(300);
await p.route(/zh-ui\.js$/,r=>r.abort());await p.goto(R+'lesson-9.html');await p.waitForTimeout(250);
ok('without zh-ui.js the static back arrow still works (Grammar)',await back(p)==='index.html#gram');await c.close();
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
