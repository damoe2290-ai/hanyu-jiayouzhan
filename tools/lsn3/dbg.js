const {chromium}=require('/opt/npm-tools/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:390,height:850}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('C',m.text().slice(0,200))});
await p.goto('file://'+process.cwd()+'/w-'+process.argv[2]);await p.waitForTimeout(800);
console.log(await p.evaluate(()=>document.body.innerText.slice(0,300)));await b.close()})();
