const {chromium}=require('/opt/npm-tools/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:390,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
for(const c of ['prac','lis','biz']){
await p.goto('file://'+process.cwd()+'/hubt/index.html#'+c);await p.reload();await p.waitForTimeout(300);
console.log(c,'lessons',await p.$$eval('a.course',e=>e.map(x=>x.getAttribute('href'))),'soon',await p.$$eval('.course.soon',e=>e.length));
await p.click('[data-go=dict]');console.log('dict',await p.$eval('p.mut',e=>e.textContent));
await p.click('[data-lf="6"]');console.log('L6',await p.$eval('p.mut',e=>e.textContent));
await p.click('[data-go=rev]');await p.click('[data-addall]');console.log('rev',await p.$$eval('.stat b',e=>e.map(x=>x.textContent)));
await p.click('[data-crs=""]');await p.waitForTimeout(100);
console.log('cards',await p.$$eval('.cc .mut',e=>e.map(x=>x.textContent)));
await p.screenshot({path:'hubt/home_'+c+'.png',fullPage:true});}
await p.click('[data-open="gram:rev"]');console.log('gram rev',await p.$$eval('.stat b',e=>e.map(x=>x.textContent)));
console.log(errs);await b.close()})();
