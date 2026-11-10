const {chromium}=require('/opt/npm-tools/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const f of ['cult-2.html','cult-3.html']){const p=await b.newPage({viewport:{width:390,height:850}});
await p.goto('file://'+process.cwd()+'/w-'+f);await p.click('[data-tab=vocab]');await p.waitForTimeout(200);
console.log(f,await p.evaluate(()=>{const W=document.documentElement.clientWidth;return [...document.querySelectorAll('#p-vocab *')].filter(e=>e.getBoundingClientRect().right>W+1||e.getBoundingClientRect().left<-1).slice(0,6).map(e=>e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().left)+'/'+Math.round(e.getBoundingClientRect().right)+' '+e.textContent.slice(0,30))}));}
await b.close()})();
