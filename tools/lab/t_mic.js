// Tone lab through the real microphone path (getUserMedia + Web Audio), Chrome's fake capture device fed a WAV.
// python3 tools/lab/mk_t4wav.py /tmp/t4.wav && W=/tmp/t4.wav node tools/lab/t_mic.js  -> expect 累 (4th tone) high, 花 and 茶 low.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+process.env.W]});
const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto((process.env.BASE||'http://localhost:8124')+'/lab/concept-a.html');await p.waitForTimeout(500);
for(const i of [3,0,3,1,3]){await p.evaluate(i=>window.__lab.go(i),i);await p.click('#rec');await p.waitForTimeout(2200);
 console.log(i,await p.evaluate(()=>window.__lab.items[window.__lab.state().cur].zh),'score',await p.$eval('#sc',e=>e.textContent),'note',await p.$eval('#note',e=>e.textContent.slice(0,20)),'res',await p.$eval('#result',e=>e.className))}
console.log(errs);await b.close()})()
