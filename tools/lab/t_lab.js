// Lab prototypes: click through every page end to end at 390px and 1100px, light and dark,
// with and without a Chinese voice; fail on console errors or horizontal overflow.
// Usage (from repo root, with a static server on BASE):  BASE=http://localhost:8124 SHOTS=lab/shots node tools/lab/t_lab.js
const {chromium}=require('playwright');
const BASE=process.env.BASE||'http://localhost:8124',OUT=process.env.SHOTS||'';
const STUB=()=>{const said=[];window.__said=said;const v={lang:'zh-CN',name:'stub zh',voiceURI:'stub'};
  Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[v],speak:u=>said.push(u.text),cancel:()=>{},onvoiceschanged:null},configurable:true});
  window.SpeechSynthesisUtterance=function(t){this.text=t}};
const NOVOICE=()=>{Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],speak:()=>{},cancel:()=>{}},configurable:true})};
const RUNS=[[390,false,true],[390,true,false],[1100,false,true],[1100,true,true]];
let fail=0;
async function page(b,vw,dark,voice,url){
  const p=await b.newPage({viewport:{width:vw,height:900},colorScheme:dark?'dark':'light'});const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(voice?STUB:NOVOICE);await p.goto(BASE+url);await p.waitForTimeout(700);
  let ov=0;const chk=async()=>{ov=Math.max(ov,await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))};
  return{p,errs,chk,ov:()=>ov};
}
const shot=async(p,name,full=true)=>{if(OUT)await p.screenshot({path:OUT+'/'+name+'.png',fullPage:full})};
function report(tag,P,extra){const ok=!P.errs.length&&P.ov()<=1;if(!ok)fail++;console.log((ok?'ok  ':'FAIL')+' '+tag+' ov '+P.ov()+' errs '+JSON.stringify(P.errs)+' '+(extra||''))}
const tagOf=(vw,dark,voice)=>vw+(dark?'-dark':'-light')+(voice?'':'-novoice');

async function testA(b,vw,dark,voice){
  const P=await page(b,vw,dark,voice,'/lab/concept-a.html'),p=P.p;
  const algo=await p.evaluate(()=>{const L=window.__lab,o={};
    const sr=48000,buf=new Float32Array(2048);o.yin=[110,180,260,350].map(f=>{for(let i=0;i<2048;i++){const t=i/sr;buf[i]=.5*Math.sin(2*Math.PI*f*t)+.25*Math.sin(4*Math.PI*f*t)}return Math.round(L.yin(buf,sr).f)});
    const mk=(fn,n=50)=>Array.from({length:n},(_,i)=>({f:fn(i/(n-1)),rms:.1}));
    const C=[x=>200*(1+.01*Math.sin(9*x)),x=>160*Math.pow(2,x*8/12),x=>x<.5?170*Math.pow(2,-x*8/12):170*Math.pow(2,(-4+(x-.5)*14)/12),x=>240*Math.pow(2,-x*11/12)];
    o.matrix=C.map(fn=>{const lv=L.framesToLevels(mk(fn),.01);return[0,1,2,3].map(i=>L.score(lv,L.items[i]).score)});return o});
  const diagOk=algo.matrix.every((r,i)=>r[i]>=85&&r.every((v,j)=>j===i||v<65));
  if(!diagOk)fail++;
  await p.click('#mTrace');const scores=[];
  for(let i=0;i<10;i++){await p.evaluate(i=>window.__lab.go(i),i);
    const T=await p.evaluate(i=>{const it=window.__lab.items[i];return window.__lab.target(it.sp||it.t).v},i);
    await p.$eval('#cv',e=>e.scrollIntoView({block:'center'}));
    const bb=await p.$eval('#cv',e=>{const r=e.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height}});
    const X=k=>bb.x+30+(bb.w-42)*k/(T.length-1),Y=l=>bb.y+34+(5-l)/4*(bb.h-50);
    await p.mouse.move(X(0),Y(T[0]));await p.mouse.down();for(let k=1;k<T.length;k+=2)await p.mouse.move(X(k),Y(T[k]+(k%4?.12:-.12)));await p.mouse.up();
    scores.push(+await p.$eval('#sc',e=>e.textContent));await P.chk();
    if(i===8){await p.waitForTimeout(450);await shot(p,'a-'+tagOf(vw,dark,voice)+'-sandhi')}}
  if(scores.some(s=>s<80))fail++;
  await p.click('#next');await p.waitForTimeout(300);await P.chk();await shot(p,'a-'+tagOf(vw,dark,voice)+'-summary');
  await p.click('#again');await p.click('#mMic');await p.click('#rec');await p.waitForTimeout(2300);await P.chk();
  const mic=await p.$eval('#note',e=>e.textContent?'no-voice-heard':'scored');
  report('A '+tagOf(vw,dark,voice),P,'yin '+algo.yin+' diag '+(diagOk?'ok':'BAD '+JSON.stringify(algo.matrix))+' trace '+scores.join(',')+' mic(fake device) '+mic);
  await p.close();
}
async function testB(b,vw,dark,voice){
  const P=await page(b,vw,dark,voice,'/lab/concept-b.html'),p=P.p;const t=tagOf(vw,dark,voice);
  await shot(p,'b-'+t+'-map');await p.click('#start');let n=0;
  while(await p.$eval('#trial',e=>!e.hidden)){const st=await p.evaluate(()=>window.__ear.state());const wrong=(st.q.f==='sib'||st.q.f==='ng');
    for(const o of await p.$$('#opts .opt')){const c=await o.getAttribute('data-c');if((c===st.q.t)!==wrong){await o.click();break}}
    if(n===2){await p.waitForTimeout(350);await shot(p,'b-'+t+'-trial',false)}await P.chk();await p.click('#nextq');n++}
  await p.waitForTimeout(400);await shot(p,'b-'+t+'-results');
  await p.click('[data-drill]');let m=0;
  while(await p.$eval('#trial',e=>!e.hidden)){const st=await p.evaluate(()=>window.__ear.state());await p.click('#opts .opt[data-c="'+st.q.t+'"]');await P.chk();await p.click('#nextq');m++}
  if(n!==23||m!==8)fail++;
  report('B '+t,P,'trials '+n+' drill '+m+' spoken '+(voice?await p.evaluate(()=>window.__said.length):'-'));await p.close();
}
async function testC(b,vw,dark,voice){
  const P=await page(b,vw,dark,voice,'/lab/concept-c.html'),p=P.p;const t=tagOf(vw,dark,voice);
  const items=await p.evaluate(()=>window.__loom.items.map(i=>[i.m,i.s]));
  for(let i=0;i<items.length;i++){
    if(i===0){await (await p.$('#tray .chip:not([data-o="'+items[i][0]+'"])')).click()}
    await p.click('#tray .chip[data-o="'+items[i][0]+'"]');if(i===0)await shot(p,'c-'+t+'-step');
    await p.click('#tray .chip[data-o="'+items[i][1]+'"]');await P.chk();
    if(i===13){await p.waitForTimeout(800);await shot(p,'c-'+t+'-knit')}
    await p.click('#nextBtn')}
  const pred=await p.evaluate(()=>window.__loom.pred.map(q=>[q.mo[0],q.po[0]]));
  for(const [mm,s] of pred){await p.click('#pm .op2[data-o="'+mm+'"]');await p.click('#pp .op2[data-o="'+s+'"]');await P.chk();await p.click('#pnext')}
  const end=await p.$eval('#pbody',e=>e.textContent.slice(0,8));if(!/8 من 8/.test(end))fail++;
  await shot(p,'c-'+t+'-predict');await p.click('#tS');await P.chk();
  report('C '+t,P,'built '+items.length+' predict '+end);await p.close();
}
async function testIndex(b,vw,dark){
  const P=await page(b,vw,dark,true,'/lab/index.html'),p=P.p;await P.chk();await shot(p,'index-'+tagOf(vw,dark,true));
  const links=await p.$$eval('a.c',a=>a.map(x=>x.getAttribute('href')));if(links.length!==3)fail++;
  report('index '+tagOf(vw,dark,true),P,links.join(' '));await p.close();
}
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
  for(const [vw,dark,voice] of RUNS){await testIndex(b,vw,dark);await testA(b,vw,dark,voice);await testB(b,vw,dark,voice);await testC(b,vw,dark,voice)}
  await b.close();console.log(fail?fail+' FAILURE(S)':'ALL PASSED');process.exit(fail?1:0)})();
