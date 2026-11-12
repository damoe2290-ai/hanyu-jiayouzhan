/* Pictures test (Lesson 7: drawn icons only).   node tools/lsn3/t_pictures.js     (run from the repo root)
   Checks: no photo, image file, image credit or preview switch is left anywhere; every picture of the lesson is an inline SVG icon marked
   aria-hidden (the word beside it is the text alternative); the 11 position words and 知道 / 没关系 have drawings and are in the picture-quiz pool;
   the page stays light; at 360px the vocabulary list fits the screen (no horizontal overflow, every speaker button on screen, fixed 44px picture
   frames); the flashcard and the picture quiz show icons in the light and dark themes; the hub's About tab has no image-credits card. */
const fs=require('fs'),path=require('path');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright','/opt/node22/lib/node_modules/playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const root=process.cwd(),R='file://'+root+'/';
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(!c&&x!==undefined?'  '+(typeof x==='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const POS=['左边','右边','前边','后边','上边','下边','里边','外边','旁边','这儿','那儿'];
(async()=>{
console.log('--- nothing left of the photo / illustration experiments (no browser)');
ok('no vendor/images folder, no tools/images.py or images.json',!fs.existsSync('vendor/images')&&!fs.existsSync('tools/images.py')&&!fs.existsSync('tools/images.json')&&!fs.existsSync('tools/scenes.py')&&!fs.existsSync('tools/illus_b.py'));
const pages=fs.readdirSync(root).filter(f=>/\.html$/.test(f));
const bad=pages.filter(f=>/vendor\/images|\.webp|class="pimg"|pics=|حقوق الصور/.test(fs.readFileSync(f,'utf8')));
ok('no page (lessons, hub) references image files, photo credits or a preview switch',bad.length===0,bad);
const src=fs.readFileSync('tools/lsn3/legacy/g7.data.js','utf8');
ok('the lesson data snippet has no photo or illustration code (PHOTO, PH_ALT, ILLUS, PICS)',!/\bPHOTO\b|\bPH_ALT\b|\bILLUS|\bPICS\b|pimg/.test(src));
ok('lesson-7.html stays light (under 330 KB, one file, no image requests)',fs.statSync('lesson-7.html').size<330*1024,fs.statSync('lesson-7.html').size);

const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
const open=async(o={})=>{const c=await b.newContext({viewport:{width:360,height:780},hasTouch:true,colorScheme:o.dark?'dark':'light'});const p=await c.newPage();p.errs=[];p.reqs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('request',r=>{if(/\.(webp|png|jpe?g|gif|svg)(\?|$)/i.test(r.url()))p.reqs.push(r.url())});
  await p.goto(R+'lesson-7.html');await p.waitForTimeout(500);return {c,p}};
console.log('--- vocabulary list at 360px (light)');
{const {c,p}=await open();
 const rows=await p.$$eval('#p-vocab .row',e=>e.map(r=>({w:r.querySelector('.rz').textContent.replace(/\s/g,''),svg:!!r.querySelector('.rp svg.il'),hid:r.querySelector('.rp svg.il')?r.querySelector('.rp svg.il').getAttribute('aria-hidden')==='true':null,img:!!r.querySelector('img')})));
 ok('the vocabulary list has 47 words and no <img> at all',rows.length===47&&rows.every(r=>!r.img),rows.filter(r=>r.img).map(r=>r.w));
 ok('37 words have a drawn icon, each marked aria-hidden',rows.filter(r=>r.svg).length===37&&rows.filter(r=>r.svg).every(r=>r.hid),rows.filter(r=>r.svg).length);
 ok('the 11 position / distance words each have a drawing',POS.every(w=>{const r=rows.find(x=>x.w===w);return r&&r.svg}),POS.filter(w=>!(rows.find(x=>x.w===w)||{}).svg));
 ok('the place words 教学楼 图书馆 运动场 体育馆 银行 中国银行 书店 邮局 have their original icon',['教学楼','楼','图书馆','运动场','体育馆','饭馆','超市','银行','中国银行','商店','书店','邮局','宿舍'].every(w=>{const r=rows.find(x=>x.w===w);return r&&r.svg}));
 ok('the picture frames have a fixed size (44px in the list)',await p.$$eval('#p-vocab .row .pic',e=>e.length>0&&e.every(x=>{const r=x.getBoundingClientRect();return Math.round(r.width)===44&&Math.round(r.height)===44})));
 ok('the list fits a 360px screen: no horizontal overflow and every speaker button is on screen (rows 运动场 and 中国银行 were wider than the screen)',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('#p-vocab .row .spk')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})));
 // flashcard
 await p.click('#p-vocab .row:nth-child(1)');await p.click('#fc');await p.waitForTimeout(800);   /* 3D flip: wait for it to finish, a rotating face is narrower */
 ok('the flashcard back shows the 92px icon',await p.$eval('#fc .back .pic',e=>!!e.querySelector('svg.il')&&Math.round(e.getBoundingClientRect().width)>=90));
 // picture quiz
 await p.click('[data-tab=practice]');await p.waitForTimeout(150);
 let seen=new Set(),icons=0,imgs=0,sizeOk=true;
 for(let k=0;k<16;k++){await p.click('[data-act=start][data-k=pic]');await p.waitForTimeout(100);
  for(let q=0;q<5;q++){const r=await p.evaluate(()=>{const pb=document.querySelector('#qbody .picbig');const q=window.__q();const it=q.list[q.i];const ans=it.opts.find(o=>o.ok);return {svg:!!(pb&&pb.querySelector('svg.il')),img:!!(pb&&pb.querySelector('img')),size:pb?Math.round(pb.getBoundingClientRect().width):0,ans:ans?(ans.zh||ans.t||ans.label||JSON.stringify(ans)):''}});
   if(r.svg)icons++;if(r.img)imgs++;if(r.size&&r.size<130)sizeOk=false;seen.add(r.ans);
   const opt=await p.evaluate(()=>{const q=window.__q();const it=q.list[q.i];return it.opts.findIndex(o=>o.ok)});
   await p.click('#qbody .opt:nth-child('+(opt+1)+')');await p.click('#qnext');await p.waitForTimeout(30)}
  await p.waitForTimeout(60);if(await p.$('[data-act=qexit]'))await p.click('[data-act=qexit]').catch(()=>{});}
 const hit=POS.filter(w=>[...seen].some(s=>String(s).includes(w)));
 ok('the picture quiz shows icons (140px frame), never a photo',icons>=40&&imgs===0&&sizeOk,{icons,imgs,sizeOk});
 ok('position words appear as picture-quiz answers (the pool grew from 18 to 29 words)',hit.length>=3,{hit});
 ok('no image request was made and no page error',p.reqs.length===0&&p.errs.length===0,{reqs:p.reqs,errs:p.errs});await c.close()}
{// the place icons are exactly the ones the lesson had before the photo experiment (commit 15e8324 = main before Phase 4a)
 const cp=require('child_process');const r=cp.spawnSync('git',['show','15e8324:lesson-7.html'],{encoding:'utf8',maxBuffer:1<<28});
 if(r.status!==0){console.log('skip  original-icon comparison (commit 15e8324 not in this clone)')}else{
  const tmp=path.join(require('os').tmpdir(),'l7-orig-'+process.pid+'.html');fs.writeFileSync(tmp,r.stdout);
  const mk=async(f)=>{const c=await b.newContext({viewport:{width:360,height:780}});const p=await c.newPage();await p.goto('file://'+f);await p.waitForTimeout(400);
   const m=await p.$$eval('#p-vocab .row',e=>Object.fromEntries(e.map(r=>[r.querySelector('.rz').textContent.replace(/\s/g,''),r.querySelector('.rp svg.il')?r.querySelector('.rp svg.il').innerHTML:null])));await c.close();return m};
  const was=await mk(tmp),now=await mk(root+'/lesson-7.html');fs.unlinkSync(tmp);
  const same=Object.keys(was).filter(w=>was[w]!==null&&!['知道','没关系'].includes(w));
  ok('every word that had an icon before Phase 4a still has exactly that icon ('+same.length+' words, 知道 and 没关系 excluded: redrawn on purpose)',same.length>=24&&same.every(w=>now[w]===was[w]),same.filter(w=>now[w]!==was[w]));
  ok('知道 and 没关系 have the new drawings (different from the old ones)',now['知道']&&now['没关系']&&now['知道']!==was['知道']&&now['没关系']!==was['没关系']);}}
console.log('--- dark theme');
{const {c,p}=await open({dark:true});
 ok('dark theme: icons render in the list, no overflow, no errors',await p.$$eval('#p-vocab .row .pic svg.il',e=>e.length===37&&e.every(s=>{const r=s.getBoundingClientRect();return r.width>=20&&r.height>=20}))&&await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&p.errs.length===0,p.errs);
 ok('dark theme: the icon strokes are visible (not the page background colour)',await p.evaluate(()=>{const s=document.querySelector('#p-vocab .row .pic svg.il *');const st=s&&getComputedStyle(s);return !!st&&st.stroke!=='none'&&st.stroke!==getComputedStyle(document.body).backgroundColor}));
 await c.close()}
console.log('--- hub About tab');
{const c=await b.newContext({viewport:{width:360,height:780},isMobile:true});const p=await c.newPage();await p.goto(R+'index.html');await p.waitForTimeout(400);await p.click('[data-go=tea]');await p.waitForTimeout(150);
 ok('the About tab has no image-credits card',(await p.$('#credits'))===null&&!(await p.evaluate(()=>document.body.innerText.includes('حقوق الصور'))));
 await c.close()}
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
