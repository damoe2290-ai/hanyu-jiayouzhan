const {chromium}=require('/opt/npm-tools/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const f of process.argv.slice(2)){for(const vw of [390,1100]){
const p=await b.newPage({viewport:{width:vw,height:850}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|net::|Failed to load/.test(m.text()))errs.push(m.text())});
await p.goto('file://'+process.cwd()+'/w-'+f);await p.waitForTimeout(300);
const ov=[];const log={};
async function chkov(n){const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(o>1)ov.push(n+':'+o)}
// tabs
for(const t of ['vocab','dialogue','grammar','writing','practice']){await p.click('[data-tab='+t+']');await p.waitForTimeout(80);await chkov(t)}
await p.click('[data-tab=vocab]');await p.click('#fc');await p.click('[data-act=again]');await p.click('[data-act=know]');
await p.click('[data-tab=dialogue]');await p.click('#p-dialogue .tok');log.sheet=await p.$eval('#sheet',e=>!e.hidden);
await p.click('[data-tab=grammar]');const gt=await p.$('#p-grammar .tok');if(gt){await gt.click();log.gsheet=await p.$eval('#sheet',e=>!e.hidden)}
await p.click('[data-tab=writing]');const cv=await p.$('#cv');const bb=await cv.boundingBox();await p.mouse.move(bb.x+50,bb.y+50);await p.mouse.down();await p.mouse.move(bb.x+120,bb.y+130);await p.mouse.up();
await p.click('[data-tab=practice]');
const kinds=await p.$$eval('.act[data-k]',e=>e.map(x=>x.dataset.k));log.kinds=kinds.join(',');
for(const k of kinds){ if(!(await p.$('.act[data-k='+k+']')))continue;
 if(k==='write'){await p.click('.act[data-k=write]');const tas=await p.$$('[data-wta]');for(const ta of tas){await ta.fill('今天天气很好，我们去游泳，好吗？太好了！')}await p.click('[data-act=qexit]');continue}
 await p.click('.act[data-k='+k+']');let n=0;
 while(await p.evaluate(()=>!!window.__q())&&n<40){n++;
  const q=await p.evaluate(()=>{const Q=window.__q();const q=Q.list[Q.i];return {t:q.type,ok:q.opts?q.opts.map(o=>o.ok):null,tok:q.s?q.s.tokens.length:0,ans:q.f?q.f.ans:null,words:q.words?q.words.length:0,pool:q.pool?q.pool.map(x=>x.i):null}});
  if(q.t==='mc'){await p.click('#qbody .opt:nth-child('+(q.ok.indexOf(true)+1)+')')}
  else if(q.t==='order'){for(let i=0;i<q.tok;i++){await p.click('#qbody .pool [data-act=pick][data-i="'+i+'"]')}await p.click('[data-act=checkorder]')}
  else if(q.t==='fill'){await p.click('#qbody .pool [data-o="'+q.ans+'"]')}
  else if(q.t==='match'){for(let i=0;i<q.words;i++){await p.click('#qbody [data-act=ml][data-i="'+i+'"]');await p.click('#qbody [data-act=mr][data-i="'+i+'"]')}}
  await p.click('#qnext');await chkov('q-'+k)}
 const res=await p.$eval('.res .sc',e=>e.textContent).catch(()=>'NA');log[k]=res;
 await p.click('[data-act=qexit]');
}
const xp=await p.$eval('.xprow .cnt',e=>e.textContent);
console.log(f,vw,'xp',xp,JSON.stringify(log),'ov',ov.join(' ')||0,'err',JSON.stringify(errs))
await p.close()}}
await b.close()})();
