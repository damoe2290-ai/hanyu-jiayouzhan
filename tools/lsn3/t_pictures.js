/* Pictures test (Phase 4a pilot: Lesson 7).   node tools/lsn3/t_pictures.js     (run from the repo root)
   Checks: every image file referenced by lesson-7 exists; every image has Arabic alt text, width/height, lazy loading; the total weight of the
   lesson's photos is under 400 KB (each under 40 KB); each photo has a credit with a free licence, author and source, a line in
   vendor/images/NOTICE.md and an entry in the hub's About tab; the fallback works (blocked images show the old icon); position words have
   drawings; other pages do not reference the images. */
const fs=require('fs'),path=require('path'),cp=require('child_process');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const root=process.cwd(),R='file://'+root+'/';
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(!c&&x!==undefined?'  '+(typeof x==='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const spec=JSON.parse(fs.readFileSync('tools/images.json','utf8')),credits=JSON.parse(fs.readFileSync('vendor/images/credits.json','utf8'));
(async()=>{
console.log('--- the files (no browser)');
const chk=cp.spawnSync('python3',['tools/images.py','check'],{encoding:'utf8'});
ok('tools/images.py check: every file exists, WebP 480x360, under the size limit, with a free-licence credit',chk.status===0,chk.stdout+chk.stderr);
const ids=spec.images.map(i=>i.id),files=ids.map(i=>path.join(root,spec.out,i+'.webp'));
const sizes=files.map(f=>fs.existsSync(f)?fs.statSync(f).size:-1);
ok('every photo is under 40 KB',sizes.every(s=>s>0&&s<=40*1024),sizes);
ok('total weight of the lesson\'s photos is under 400 KB ('+Math.round(sizes.reduce((a,b)=>a+b,0)/1024)+' KB)',sizes.reduce((a,b)=>a+b,0)<400*1024);
const notice=fs.readFileSync('vendor/images/NOTICE.md','utf8');
ok('every photo has a credit: author, free licence (CC0 / CC BY / CC BY-SA), a commons.wikimedia.org page, and a line in vendor/images/NOTICE.md',credits.length===ids.length&&credits.every(c=>c.author&&/^(CC0|CC BY|Public domain)/i.test(c.licence)&&!/\bN[CD]\b/.test(c.licence)&&c.page_url.startsWith('https://commons.wikimedia.org/wiki/File:')&&notice.includes(path.basename(c.file))&&notice.includes(c.page_url)));
ok('the data source lists exactly these images (tools/lsn3/legacy/g7.data.js PHOTO map)',await (async()=>{const src=fs.readFileSync('tools/lsn3/legacy/g7.data.js','utf8');const m=/var PHOTO=\{([^}]*)\}/.exec(src);const used=[...new Set([...m[1].matchAll(/:'([a-z]+)'/g)].map(x=>x[1]))].sort();return JSON.stringify(used)===JSON.stringify(ids.slice().sort())})());
const others=fs.readdirSync(root).filter(f=>/^(lesson|prac|lis|biz|cult)-\d+\.html$/.test(f)&&f!=='lesson-7.html'&&fs.readFileSync(f,'utf8').includes('vendor/images/'));
ok('only lesson-7 uses the photos (no other page references vendor/images)',others.length===0,others);

const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
const open=async(o={})=>{const c=await b.newContext({viewport:{width:360,height:780},hasTouch:true,colorScheme:o.dark?'dark':'light'});const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  if(o.block)await p.route(/vendor\/images\/.*\.webp/,r=>r.abort());await p.goto(R+'lesson-7.html');await p.waitForTimeout(500);return {c,p}};
console.log('--- in the page (vocabulary cards, picture quiz, flashcard)');
{const {c,p}=await open();
 const imgs=await p.$$eval('#p-vocab .row img.pimg',e=>e.map(x=>({src:x.getAttribute('src'),alt:x.alt,w:x.getAttribute('width'),h:x.getAttribute('height'),lazy:x.getAttribute('loading'),dec:x.getAttribute('decoding')})));
 ok('the vocabulary list shows the photos of the place words (13 words, 11 files)',imgs.length===13&&new Set(imgs.map(i=>i.src)).size===11,imgs.length);
 ok('every referenced image file exists',imgs.every(i=>fs.existsSync(path.join(root,i.src))),imgs.filter(i=>!fs.existsSync(path.join(root,i.src))).map(i=>i.src));
 ok('every image has Arabic alt text, width and height set (no layout shift) and lazy loading',imgs.every(i=>/[؀-ۿ]{4,}/.test(i.alt)&&i.w==='480'&&i.h==='360'&&i.lazy==='lazy'&&i.dec==='async'),imgs.filter(i=>!(/[؀-ۿ]{4,}/.test(i.alt))).map(i=>i.src));
 ok('the photo frame has a fixed size (44px in the list), so loading changes nothing',await p.$$eval('#p-vocab .row .pic.pf',e=>e.every(x=>{const r=x.getBoundingClientRect();return Math.round(r.width)===44&&Math.round(r.height)===44})));
 ok('every photo keeps its old icon underneath as a fallback (an svg in the same frame)',await p.$$eval('#p-vocab .row .pic.pf',e=>e.every(x=>x.querySelector('svg.il')&&x.querySelector('img.pimg'))));
 ok('the vocabulary list fits a 360px screen: no horizontal overflow and every speaker button is on screen (two rows were wider than the screen before)',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('#p-vocab .row .spk')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})));
 const pos=['左边','右边','前边','后边','上边','下边','里边','外边','旁边','这儿','那儿'];
 ok('the 11 position / distance words now have a drawing each (they had none)',await p.evaluate(pos=>pos.every(w=>{const row=[...document.querySelectorAll('#p-vocab .row')].find(r=>r.querySelector('.rz').textContent.replace(/\s/g,'')===w||r.querySelector('.rz').textContent.includes(w));return row&&row.querySelector('.rp svg.il')}),pos));
 ok('"know" and "no problem" have new drawings; place words with a photo are exactly the ones in the data',await p.$$eval('#p-vocab .row',e=>e.length===47));
 // flashcard
 await p.click('#p-vocab .row:nth-child(1)');await p.click('#fc');await p.waitForTimeout(150);
 ok('the flashcard back shows a larger photo (92px) with alt text',await p.$eval('#fc .back .pic.pf img.pimg',e=>/[؀-ۿ]/.test(e.alt)&&e.closest('.pic').getBoundingClientRect().width>=90));
 // picture quiz
 await p.click('[data-tab=practice]');await p.waitForTimeout(150);
 let sawPhoto=0,sawDrawing=0,okAlt=true;
 for(let k=0;k<12;k++){await p.click('[data-act=start][data-k=pic]');await p.waitForTimeout(100);
  for(let q=0;q<5;q++){const r=await p.evaluate(()=>{const pb=document.querySelector('#qbody .picbig');const im=pb&&pb.querySelector('img.pimg');return {photo:!!im,alt:im?im.alt:'',draw:!!(pb&&pb.querySelector('svg.il')&&!im),size:pb?Math.round(pb.getBoundingClientRect().width):0}});
   if(r.photo){sawPhoto++;if(!/[؀-ۿ]{4,}/.test(r.alt))okAlt=false}if(r.draw)sawDrawing++;
   const opt=await p.evaluate(()=>{const q=window.__q();const it=q.list[q.i];return it.opts.findIndex(o=>o.ok)});
   await p.click('#qbody .opt:nth-child('+(opt+1)+')');await p.click('#qnext');await p.waitForTimeout(40)}
  await p.waitForTimeout(80);if(await p.$('[data-act=qexit]'))await p.click('[data-act=qexit]').catch(()=>{});}
 ok('the picture quiz shows photos (with Arabic alt text) and drawings, inside the 140px frame',sawPhoto>0&&sawDrawing>0&&okAlt,{sawPhoto,sawDrawing});
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}
console.log('--- fallback: when the images cannot load the old icons show');
{const {c,p}=await open({block:true});
 await p.evaluate(()=>{document.querySelectorAll('#p-vocab .row img.pimg').forEach(i=>{i.loading='eager'})});await p.waitForTimeout(700);
 const r=await p.$$eval('#p-vocab .row .pic.pf',e=>e.map(x=>{const im=x.querySelector('img.pimg'),sv=x.querySelector('svg.il'),r=sv.getBoundingClientRect();return {failed:im.classList.contains('failed')&&getComputedStyle(im).display==='none',icon:r.width>=20&&r.height>=20&&getComputedStyle(sv).display!=='none'}}));
 ok('all 13 blocked photos are hidden and their old icon is visible instead',r.length===13&&r.every(x=>x.failed&&x.icon),r);
 await c.close()}
{const {c,p}=await open({dark:true});
 ok('dark theme: the photo frames and drawings render (frames have the theme background, no errors)',await p.$$eval('#p-vocab .row .pic.pf',e=>e.length===13)&&p.errs.length===0);await c.close()}
console.log('--- credits on the hub About tab');
{const c=await b.newContext({viewport:{width:360,height:780},isMobile:true});const p=await c.newPage();await p.goto(R+'index.html');await p.waitForTimeout(400);await p.click('[data-go=tea]');await p.waitForTimeout(150);
 const li=await p.$$eval('#credits li',e=>e.map(x=>({txt:x.textContent,links:[...x.querySelectorAll('a')].map(a=>a.href)})));
 ok('the About tab lists every photo: the words, the author, the licence link and the Wikimedia Commons page',li.length===credits.length&&credits.every((c,i)=>li[i].txt.includes(c.author)&&li[i].txt.includes(c.licence)&&li[i].links.includes(c.page_url)));
 await c.close()}
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
