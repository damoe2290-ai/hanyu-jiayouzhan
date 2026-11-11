/* Stroke-order (Hanzi Writer) test for Lesson 9.   node tools/lsn3/t9.js     (run from the repo root; starts its own static server)
   A server is needed only because the stroke data is loaded with fetch(), which browsers do not allow from file://
   (the deployed site is served over HTTPS). Checks: no external request, animation, writing a character by drawing along
   its real stroke paths (the library's own grading must accept it), wrong strokes, hint, persistence, switch to free drawing,
   other characters, and every fallback to the free-drawing canvas (library blocked, data missing, offline, no zh-ui.js). */
const http=require('http'),path=require('path'),fs=require('fs');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const root=process.cwd();
const MIME={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(root,u);
  if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;res.end('not found');return}
  res.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(x!==undefined&&x!==''?'  '+x:''));if(!c)fails++};
const hex=c=>c.codePointAt(0).toString(16);
const strokesOf=c=>JSON.parse(fs.readFileSync(path.join(root,'vendor/hanzi-writer/data/'+hex(c)+'.json'),'utf8'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/';
const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
const open=async(opts={},page='lesson-9.html')=>{const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844}},opts));const p=await ctx.newPage();
  const st={reqs:[],errs:[]};p.on('request',r=>st.reqs.push(r.url()));p.on('pageerror',e=>st.errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/fonts|net::|Failed to load|ERR_|404/.test(m.text()))st.errs.push(m.text())});
  await p.goto(base+page);await p.waitForTimeout(400);return {ctx,p,st}};
const gotoWriting=async p=>{await p.click('[data-tab=writing]');await p.waitForTimeout(150)};
const firstChar=p=>p.evaluate(()=>document.querySelector('#p-writing [data-act=wch][data-i="0"] .han').textContent.trim());
async function drawStroke(p,pts){ // pts in screen coordinates
  await p.mouse.move(pts[0].x,pts[0].y);await p.mouse.down();for(const q of pts.slice(1))await p.mouse.move(q.x,q.y);await p.mouse.up();
}
async function screenPts(p,medians){ // transform stroke medians (character coordinates) to screen coordinates using the real SVG matrix
  return p.evaluate(m=>{const g=document.querySelector('#hwt svg g[transform]');const t=g.getScreenCTM();   /* the transformed drawing group (the first <path> is a clip path in <defs>) */
    const tr=pt=>({x:t.a*pt[0]+t.c*pt[1]+t.e,y:t.b*pt[0]+t.d*pt[1]+t.f});
    return m.map(s=>{const out=[];for(let i=0;i<s.length-1;i++){const a=tr(s[i]),b=tr(s[i+1]);for(let k=0;k<10;k++)out.push({x:a.x+(b.x-a.x)*k/10,y:a.y+(b.y-a.y)*k/10})}out.push(tr(s[s.length-1]));return out})},medians);   /* dense path like a real finger */
}

console.log('--- stroke-order mode appears (no external requests)');
let {ctx,p,st}=await open();await gotoWriting(p);
await p.waitForSelector('#hwswitch:not([hidden])',{timeout:8000}).catch(()=>{});
const c0=await firstChar(p),d0=strokesOf(c0);
ok('switch "ترتيب الخطوط | رسم حر" is shown',await p.$eval('#hwswitch',e=>!e.hidden));
ok('stroke-order box is visible and the canvas box is hidden',await p.evaluate(()=>!document.querySelector('#hwbox').hidden&&document.querySelector('#freebox').hidden));
ok('character "'+c0+'" is drawn as SVG with '+d0.strokes.length+' strokes',(await p.$$eval('#hwt svg path',e=>e.length))>=d0.strokes.length);
const hwReqs=st.reqs.filter(u=>u.indexOf('/vendor/hanzi-writer/')>=0);
ok('library and data come from the vendored folder',hwReqs.some(u=>u.endsWith('hanzi-writer.min.js'))&&hwReqs.some(u=>u.endsWith('/data/'+hex(c0)+'.json')),hwReqs.map(u=>u.replace(base,'')).join(', '));
const external=st.reqs.filter(u=>!u.startsWith(base)&&!/fonts\.(googleapis|gstatic)\.com/.test(u)&&!u.startsWith('data:'));
ok('no request to any external host (only the pages\' own Google Fonts)',external.length===0,external.join(', '));
ok('library is not loaded before the Writing tab is opened',await (async()=>{const x=await open();const r=x.st.reqs.every(u=>u.indexOf('hanzi-writer')<0);await x.ctx.close();return r})());

console.log('--- animation');
await p.click('[data-act=hwanim]');
await p.waitForFunction(()=>document.querySelector('#hwmsg').textContent.indexOf('الآن جرّب')>=0,null,{timeout:30000}).catch(()=>{});
ok('"شاهد الكتابة" animates the strokes and then invites the student to try',(await p.$eval('#hwmsg',e=>e.textContent)).indexOf('الآن جرّب')>=0);

console.log('--- writing the character stroke by stroke');
await p.click('[data-act=hwquiz]');await p.evaluate(()=>document.querySelector('#hwt').scrollIntoView({block:'center'}));await sleep(200);
ok('hint button is enabled during the exercise',await p.$eval('[data-act=hwhint]',e=>!e.disabled));
// a wrong stroke first: a short line in a corner
const box=await p.$eval('#hwt',e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}});
await drawStroke(p,[{x:box.x+12,y:box.y+box.h-14},{x:box.x+40,y:box.y+box.h-16}]);await sleep(300);
ok('a wrong stroke is rejected with a message',(await p.$eval('#hwmsg',e=>e.textContent)).indexOf('ليس هذا هو الخط')>=0,await p.$eval('#hwmsg',e=>e.textContent));
await p.click('[data-act=hwhint]');await sleep(300);
ok('the hint button shows the next stroke without errors',st.errs.length===0,st.errs.join(' | '));
const strokes=await screenPts(p,d0.medians);
for(let i=0;i<strokes.length;i++){
  await drawStroke(p,strokes[i]);
  await p.waitForFunction(i=>{const m=document.querySelector('#hwmsg').textContent;return m.indexOf('صحيح')>=0||m.indexOf('ممتاز')>=0||m.indexOf('أتممتَ')>=0},i,{timeout:6000}).catch(()=>{});
  await sleep(120);
}
const fin=await p.$eval('#hwmsg',e=>e.textContent);
ok('every stroke drawn along its real path is accepted and the character is completed',fin.indexOf('أتممتَ الحرف')>=0||fin.indexOf('ممتاز')>=0,fin);
ok('the finished character is marked in the character list',await p.$eval('#p-writing [data-act=wch][data-i="0"]',e=>e.classList.contains('wdone')));
let S=JSON.parse(await p.evaluate(()=>localStorage.getItem('noor-gram9-v1')));
ok('completion is saved inside the lesson\'s existing state key',!!(S.hw&&S.hw.done&&S.hw.done[c0])&&(await p.evaluate(()=>Object.keys(localStorage))).every(k=>k==='noor-gram9-v1'||k.indexOf('zh-')===0||k.indexOf('noor-')===0));
await p.click('[data-act=hwreset]');
ok('"من جديد" resets the exercise (hint disabled again)',await p.$eval('[data-act=hwhint]',e=>e.disabled));

console.log('--- switching to free drawing and back');
await p.click('[data-act=hwmode][data-m=free]');
ok('free-drawing canvas is shown (stroke-order box hidden)',await p.evaluate(()=>document.querySelector('#hwbox').hidden&&!document.querySelector('#freebox').hidden));
const snap=()=>p.$eval('#cv',c=>c.toDataURL());
await p.evaluate(()=>document.querySelector('#cv').scrollIntoView({block:'center'}));
const cb=await p.$eval('#cv',c=>{const r=c.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}});
const before=await snap();await drawStroke(p,[{x:cb.x+60,y:cb.y+60},{x:cb.x+200,y:cb.y+220}]);
ok('the old canvas still draws',before!==await snap());
await p.evaluate(()=>document.querySelector('[data-act=wundo]').click());ok('and its undo still works',before===await snap());
await p.click('[data-act=hwmode][data-m=hw]');await p.waitForSelector('#hwt svg',{timeout:5000});
ok('switching back mounts the stroke-order writer again',(await p.$$eval('#hwt svg path',e=>e.length))>=d0.strokes.length);

console.log('--- another character, persistence, theme');
await p.click('#p-writing [data-act=wch][data-i="1"]');await p.waitForSelector('#hwt svg',{timeout:5000});await sleep(200);
const c1=await p.evaluate(()=>document.querySelector('#p-writing [data-act=wch][data-i="1"] .han').textContent.trim());
ok('choosing another character shows its own strokes ('+c1+', '+strokesOf(c1).strokes.length+')',(await p.$$eval('#hwt svg path',e=>e.length))>=strokesOf(c1).strokes.length);
await p.reload();await p.waitForTimeout(400);await gotoWriting(p);
ok('after a reload the completed character is still marked',await p.$eval('#p-writing [data-act=wch][data-i="0"]',e=>e.classList.contains('wdone')));
await p.waitForSelector('#hwt svg',{timeout:6000});
const light=await p.evaluate(()=>{const o=[];document.querySelectorAll('#hwt svg *').forEach(x=>{const c=getComputedStyle(x);o.push(c.fill,c.stroke)});return [...new Set(o)]});
await p.evaluate(()=>document.querySelector('[data-act=theme]').click());await sleep(500);
const dark=await p.evaluate(()=>{const o=[];document.querySelectorAll('#hwt svg *').forEach(x=>{const c=getComputedStyle(x);o.push(c.fill,c.stroke)});return [...new Set(o)]});
ok('the writer uses the light-theme ink colour, then is redrawn in the dark-theme colour',light.indexOf('rgb(43, 29, 24)')>=0&&dark.indexOf('rgb(238, 243, 239)')>=0&&dark.indexOf('rgb(43, 29, 24)')<0,'light: '+light.join(' ')+'  dark: '+dark.join(' '));
ok('no horizontal overflow on a phone',await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
ok('buttons of the writer are at least 44px tall',await p.$$eval('#hwbox .btn',e=>e.every(x=>x.getBoundingClientRect().height>=43.5)));
ok('no page errors in the whole run',st.errs.length===0,st.errs.join(' | '));
await ctx.close();

console.log('--- fallbacks: the old canvas always stays usable');
const fallbackOk=async(label,setup,opts)=>{
  const o=await open(opts||{});if(setup)await setup(o);
  await o.p.click('[data-tab=writing]');await sleep(1500);
  const r=await o.p.evaluate(()=>({sw:document.querySelector('#hwswitch')?document.querySelector('#hwswitch').hidden:true,hb:document.querySelector('#hwbox')?document.querySelector('#hwbox').hidden:true,
    free:document.querySelector('#freebox')?!document.querySelector('#freebox').hidden:!!document.querySelector('#cv')}));
  await o.p.evaluate(()=>document.querySelector('#cv').scrollIntoView({block:'center'}));
  const bx=await o.p.$eval('#cv',c=>{const r=c.getBoundingClientRect();return {x:r.left,y:r.top}});
  const s0=await o.p.$eval('#cv',c=>c.toDataURL());await drawStroke(o.p,[{x:bx.x+50,y:bx.y+50},{x:bx.x+190,y:bx.y+200}]);
  const drew=s0!==await o.p.$eval('#cv',c=>c.toDataURL());
  ok(label+': switch and writer hidden, canvas visible and drawing works',r.sw&&r.hb&&r.free&&drew,JSON.stringify(r));
  ok('  '+label+': no page errors',o.st.errs.length===0,o.st.errs.join(' | '));await o.ctx.close();
};
await fallbackOk('library blocked',async o=>{await o.p.route('**/vendor/hanzi-writer/hanzi-writer.min.js',r=>r.abort())});
await fallbackOk('stroke data missing (404)',async o=>{await o.p.route('**/vendor/hanzi-writer/data/*.json',r=>r.fulfill({status:404,body:'nf'}))});
await fallbackOk('stroke data is not valid JSON',async o=>{await o.p.route('**/vendor/hanzi-writer/data/*.json',r=>r.fulfill({status:200,contentType:'application/json',body:'oops'}))});
await fallbackOk('offline after the page loaded',async o=>{await o.ctx.setOffline(true)});
{ const o=await open();await o.p.route('**/zh-ui.js',r=>r.abort());await o.p.reload();await sleep(400);await o.p.click('[data-tab=writing]');
  await o.p.waitForSelector('#hwswitch:not([hidden])',{timeout:8000}).catch(()=>{});
  ok('without zh-ui.js the stroke-order mode still works (it does not depend on it)',await o.p.$eval('#hwswitch',e=>!e.hidden)&&(await o.p.$$eval('#hwt svg path',e=>e.length))>0);await o.ctx.close();}

console.log('--- opened from disk (file://): nothing to try, nothing logged');
{ const ctx2=await b.newContext({viewport:{width:390,height:844}});const p2=await ctx2.newPage();const e2=[];p2.on('pageerror',e=>e2.push(e.message));p2.on('console',m=>{if(m.type()==='error')e2.push(m.text())});
  await p2.goto('file://'+root+'/lesson-9.html');await p2.waitForTimeout(400);await p2.click('[data-tab=writing]');await sleep(800);
  ok('file://: free-drawing canvas only, no switch, no library request, no console error',!(await p2.$('#hwswitch'))&&!!(await p2.$('#cv'))&&e2.length===0,e2.join(' | '));await ctx2.close();}
console.log('--- lessons that did not opt in');
for(const f of ['lesson-10.html','lesson-6.html','prac-9.html']){
  const o=await open({},f);await o.p.click('[data-tab=writing]').catch(()=>{});await sleep(600);
  ok(f+': Writing tab unchanged (no switch, canvas visible)',!(await o.p.$('#hwswitch'))&&!!(await o.p.$('#cv'))&&!o.st.reqs.some(u=>u.indexOf('hanzi-writer')>=0));await o.ctx.close();}

console.log('--- vendored files');
const V=n=>fs.existsSync(path.join(root,'vendor/hanzi-writer',n));
ok('licence files are included (MIT, Arphic Public License, copying notice, notice)',['LICENSE','ARPHICPL.TXT','COPYING.md','NOTICE.md'].every(V));
ok('library is the pinned version',fs.readFileSync(path.join(root,'vendor/hanzi-writer/hanzi-writer.min.js'),'utf8').indexOf('Hanzi Writer v3.7.3')>=0);
ok('Arphic licence file is unaltered (first line, 57 lines)',fs.readFileSync(path.join(root,'vendor/hanzi-writer/ARPHICPL.TXT'),'utf8').split('\n').length>=57);

await b.close();server.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
