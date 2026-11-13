let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright']){try{({chromium}=require(m));break}catch(e){}}
const fs=require('fs');const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
/* the first-visit welcome of the hub (Phase 6c) would sit on top of a fresh hub: these older tests are about other things, so every context auto-skips it (t16.js and hubt/t17.js test the welcome itself) */
{const nw=()=>{document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{const x=document.querySelector('#wel .wl-act [data-wl=skip]');if(x)x.click()},0))};const nc=b.newContext.bind(b),np=b.newPage.bind(b);
 b.newContext=async o=>{const c=await nc(o);await c.addInitScript(nw);return c};b.newPage=async o=>{const c=await nc(o);await c.addInitScript(nw);return c.newPage()}}

const p=await b.newPage({viewport:{width:390,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
for(const c of ['prac','lis','biz']){
await p.goto('file://'+process.cwd()+'/'+(process.env.HUB||'hubt/index.html')+'#'+c);await p.reload();await p.waitForTimeout(300);
console.log(c,'lessons',await p.$$eval('a.course',e=>e.map(x=>x.getAttribute('href'))),'soon',await p.$$eval('.course.soon',e=>e.length));
await p.click('[data-go=dict]');console.log('dict',await p.$eval('p.mut',e=>e.textContent));
await p.click('[data-lf="6"]');console.log('L6',await p.$eval('p.mut',e=>e.textContent));
await p.click('[data-go=rev]');await p.click('[data-addall]');console.log('rev',await p.$$eval('.stat b',e=>e.map(x=>x.textContent)));
await p.click('[data-crs=""]');await p.waitForTimeout(100);
console.log('courses on the home page (level -> course)',await p.$$eval('details.lvl .cb .ci .mut',e=>e.map(x=>x.textContent)).catch(()=>[]).then(a=>a.length));
await p.screenshot({path:require('os').tmpdir()+'/hub_home_'+c+'.png',fullPage:true});}
await p.click('details.tools summary');   /* the quick dictionary/review tiles are collapsed by default */
await p.click('[data-open="gram:rev"]');console.log('gram rev',await p.$$eval('.stat b',e=>e.map(x=>x.textContent)));
console.log(errs);await b.close()})();
