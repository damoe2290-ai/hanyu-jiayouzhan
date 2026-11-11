let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright']){try{({chromium}=require(m));break}catch(e){}}
const fs=require('fs');const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
const p=await b.newPage({viewport:{width:390,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
for(const c of ['gram','fl']){
await p.goto('file://'+process.cwd()+'/'+(process.env.HUB||'hubt/index.html')+'#'+c);await p.reload();await p.waitForTimeout(300);
console.log(c,'lessons',await p.$$eval('a.course',e=>e.map(x=>x.getAttribute('href'))),'soon',await p.$$eval('.course.soon',e=>e.length));
await p.click('[data-go=dict]');console.log('dict',await p.$eval('p.mut',e=>e.textContent));
await p.click('[data-lf="9"]');console.log('L9',await p.$eval('p.mut',e=>e.textContent));
await p.click('[data-lf="10"]');console.log('L10',await p.$eval('p.mut',e=>e.textContent));
await p.click('[data-go=rev]');await p.click('[data-addall]');console.log('rev',await p.$$eval('.stat b',e=>e.map(x=>x.textContent)));
await p.click('[data-crs=""]');await p.waitForTimeout(100);}
console.log(errs);await b.close()})();
