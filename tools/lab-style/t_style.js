// Style prototypes: walk every direction (home + whole lesson) at 390 and 1100, light and dark, with and without a Chinese voice.
// Fails on console errors, horizontal overflow, tap targets under 44px, or an unfinished lesson.
// Usage: BASE=http://localhost:8125 SHOTS=<dir> node tools/lab-style/t_style.js [1 2 3 4]
const {chromium}=require('playwright');
const BASE=process.env.BASE||'http://localhost:8125',OUT=process.env.SHOTS||'';
const STUB=()=>{const said=[];window.__said=said;const v={lang:'zh-CN',name:'stub',voiceURI:'stub'};
  Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[v],speak:u=>said.push(u.text),cancel:()=>{},onvoiceschanged:null},configurable:true});window.SpeechSynthesisUtterance=function(t){this.text=t}};
const NOV=()=>{Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],speak:()=>{},cancel:()=>{}},configurable:true})};
const RUNS=[[390,false,true],[390,true,false],[1100,false,true],[1100,true,true]];
const want=process.argv.slice(2).map(Number);let fail=0;
async function audit(p){return p.evaluate(()=>{const W=document.documentElement.clientWidth,ov=document.documentElement.scrollWidth-W;
  const small=[...document.querySelectorAll('button,a,[role=tab],input,select,summary')].filter(e=>{if(e.offsetParent===null&&getComputedStyle(e).position!=='fixed')return false;if(e.closest('[hidden],details:not([open]) > :not(summary)'))return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<43.5||r.height<43.5)})
   .map(e=>(e.className||e.tagName)+':'+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)+':'+(e.textContent||'').trim().slice(0,12));return{ov,small}})}
const DRIVERS={
 1:async(p,A)=>{await A('home');await p.click('#resume');await p.waitForTimeout(300);await A('lesson-top');
   await p.click('.ln button.say');await p.click('#tPy');await p.click('#tPy');await p.click('.vw');await A('read');
   await p.click('[data-fin=read]');await p.evaluate(()=>window.__ls.solve(document.getElementById('lq')));await A('listen');
   for(const b of await p.$$('[data-said]'))await b.click();await p.evaluate(()=>window.__ls.solve(document.getElementById('wq')));await A('write');
   await p.evaluate(()=>window.__ls.solve(document.getElementById('rq')));await p.waitForTimeout(200);await A('end');
   return await p.$eval('#end',e=>e.dataset.complete==='1')},
 2:async(p,A)=>{await A('home');await p.click('#resume');await p.waitForTimeout(300);await A('lesson-top');
   for(let s=0;s<4;s++){for(const l of await p.$$('.scene.cur .pane'))await l.click();
     const chips=await p.$$('.scene.cur .chip');if(chips[0])await chips[0].click();const lens=await p.$('.scene.cur .lensbtn');if(lens)await lens.click();
     await A('scene'+s);await p.evaluate(()=>window.__ls.solve(document.querySelector('.scene.cur')));await p.waitForTimeout(150);await A('check'+s);
     const nx=await p.$('.scene.cur [data-next]');if(nx)await nx.click();await p.waitForTimeout(250)}
   await p.click('#basketBtn');await A('basket');await p.click('#closeBasket');
   return await p.evaluate(()=>!!document.querySelector('[data-complete="1"]'))},
 3:async(p,A)=>{await A('home');await p.click('#resume');await p.waitForTimeout(300);let n=0;const seen={};
   while(n<200){n++;const st=await p.evaluate(()=>{const c=document.querySelector('.card.cur');return c?{k:c.dataset.k,end:!!c.dataset.end,all:!!document.querySelector('[data-complete="1"]')}:null});
     if(!st||st.all)break;
     if(st.k==='word'){if(!seen.word){seen.word=1;await p.click('.card.cur .flip');await A('card-word')}else await p.click('.card.cur .flip');await p.click('.card.cur [data-know]');continue}
     else if(st.k==='line'){await p.click('.card.cur .say')}
     else if(st.k==='q'){await p.evaluate(()=>window.__ls.solve(document.querySelector('.card.cur')))}
     if(!seen[st.k]){seen[st.k]=1;await A('card-'+st.k)}
     if(st.end){const nx=await p.$('.card.cur [data-nextcup]');if(nx){await nx.click();await p.waitForTimeout(150);continue}else break}
     await p.click('#next');await p.waitForTimeout(60)}
   await A('final');return await p.evaluate(()=>!!document.querySelector('[data-complete="1"]'))},
 4:async(p,A)=>{await A('home');await p.click('#resume');await p.waitForTimeout(300);await A('board');
   for(const t of ['texts','words','drills','board']){await p.click('.tabbar [data-tab='+t+']');await p.waitForTimeout(150);
     if(t==='texts'){for(const b of await p.$$('#v-texts details summary'))await b.click();const s=await p.$('#v-texts .say');if(s)await s.click();const g=await p.$('#v-texts .gtag');if(g){await g.click();await A('gram-sheet');await p.click('#sheetClose')}}
     if(t==='words'){await p.click('#v-words .w');await p.click('#v-words [data-f=new]');await p.click('#v-words [data-f=all]');await p.click('#v-words [data-wdone]')}
     if(t==='drills'){let k=0;while(k<20&&await p.$('#v-drills .q:not([data-done])')){k++;await p.evaluate(()=>window.__ls.solve(document.getElementById('v-drills')));const nx=await p.$('#v-drills [data-more]');if(nx)await nx.click();else break}}
     await A('tab-'+t)}
   return await p.evaluate(()=>!!document.querySelector('[data-complete="1"]'))}};
(async()=>{const b=await chromium.launch();
 if(!want.length||want.includes(0))for(const [vw,dark] of [[390,false],[390,true],[1100,false]]){const p=await b.newPage({viewport:{width:vw,height:844},colorScheme:dark?'dark':'light'});const errs=[];
   p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});await p.goto(BASE+'/lab-style/index.html');await p.waitForTimeout(500);
   const a=await audit(p),n=await p.$$eval('a.c',x=>x.length);if(OUT&&vw===390)await p.screenshot({path:OUT+'/index-'+vw+(dark?'-dark':'-light')+'.png',fullPage:true});
   const ok=!errs.length&&a.ov<=1&&!a.small.length&&n===4;if(!ok)fail++;console.log((ok?'ok  ':'FAIL')+' index-'+vw+(dark?'-dark':'-light')+' links '+n+' ov '+a.ov+' small '+JSON.stringify(a.small)+' errs '+JSON.stringify(errs));await p.close()}
 for(const n of [1,2,3,4]){if(want.length&&!want.includes(n))continue;
  for(const [vw,dark,voice] of RUNS){const tag='d'+n+'-'+vw+(dark?'-dark':'-light')+(voice?'':'-novoice');
   const p=await b.newPage({viewport:{width:vw,height:844},colorScheme:dark?'dark':'light'});const errs=[];
   p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
   await p.addInitScript(voice?STUB:NOV);
   const res=await p.goto(BASE+'/lab-style/direction-'+n+'.html');if(!res||!res.ok()){console.log('FAIL load',tag);fail++;continue}
   await p.waitForTimeout(700);let ov=0;const small=new Set();
   const A=async(name)=>{const a=await audit(p);ov=Math.max(ov,a.ov);a.small.forEach(s=>small.add(s));if(OUT&&vw===390)await p.screenshot({path:OUT+'/'+tag+'-'+name+'.png',fullPage:name==='home'||name==='end'||name==='final'})};
   let complete=false;try{complete=await DRIVERS[n](p,A)}catch(e){errs.push('driver: '+e.message.split('\n')[0])}
   const ok=!errs.length&&ov<=1&&!small.size&&complete;if(!ok)fail++;
   console.log((ok?'ok  ':'FAIL')+' '+tag+' complete '+complete+' ov '+ov+' small '+JSON.stringify([...small].slice(0,6))+' errs '+JSON.stringify(errs.slice(0,3)));
   await p.close()}}
 await b.close();console.log(fail?fail+' FAILURE(S)':'ALL PASSED');process.exit(fail?1:0)})();
