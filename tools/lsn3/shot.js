const {chromium}=require('/opt/npm-tools/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
await p.goto('file://'+process.cwd()+'/w-lesson-9.html');await p.waitForTimeout(400);
await p.click('[data-tab=grammar]');await p.waitForTimeout(200);await p.evaluate(()=>{const e=[...document.querySelectorAll('#p-grammar .sub-h')].find(x=>x.textContent.includes('综合注释'));e.scrollIntoView()});await p.screenshot({path:'s9g.png'});
await p.click('[data-tab=dialogue]');await p.waitForTimeout(200);await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:'s9d.png'});await b.close()})();
