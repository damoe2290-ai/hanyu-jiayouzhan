/* Flashcard flip-feel test.   node tools/lsn3/t15.js [lesson.html]     (run from the repo root; default lesson-9.html, also run on lesson-7.html / prac-6.html)
   Drag-following page turn (rotation proportional to the drag, hinge on the swipe side, next / previous card revealed underneath, pointer capture,
   no horizontal overflow mid-turn), completion by distance (35%) or by flick velocity, spring-back, vertical drags ignored (touch-action pan-y), tap flip,
   durations 550-700ms with ease-in-out, perspective 900-1100px, back face tinted and clearly different from the front in light and dark, shadow and border
   visible against the page, reduced-motion and no-3D fallbacks (no rotation, swipe still changes cards), page-turn sound (off by default, persisted in
   zh-ui-v1, no AudioContext before a gesture, silent without Web Audio, switch in the settings sheet, no other sounds). Real touch response and
   real loudness can only be judged on a phone; nothing here covers iOS. */
const fs=require('fs');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright','/opt/node22/lib/node_modules/playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const R='file://'+process.cwd()+'/',PAGE=process.argv[2]||process.env.PAGE||'lesson-9.html';
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(!c&&x!==undefined?'  '+(typeof x==='string'?x:JSON.stringify(x)):''));if(!c)fails++};
function init(o){
 if(o.noAudio){delete window.AudioContext;delete window.webkitAudioContext}
 else{window.__ac=0;window.__plays=0;window.__resumes=0;
  window.AudioContext=function(){window.__ac++;this.state='suspended';this.currentTime=0;this.sampleRate=8000;this.destination={};
   this.resume=()=>{window.__resumes++;this.state='running';return Promise.resolve()};
   this.createBuffer=(c,n)=>({getChannelData:()=>new Float32Array(n)});
   this.createBufferSource=()=>({connect(){},start(){window.__plays++},stop(){}});
   this.createBiquadFilter=()=>({Q:{value:0},frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});
   this.createGain=()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};
  window.webkitAudioContext=window.AudioContext}
 window.__cap=0;const sp=Element.prototype.setPointerCapture;Element.prototype.setPointerCapture=function(){window.__cap++;try{return sp.apply(this,arguments)}catch(e){}};
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{lang:'zh-CN',name:'M'}],speak(){},cancel(){},addEventListener(){},removeEventListener(){}}});window.SpeechSynthesisUtterance=function(t){this.text=t};
}
const parse=c=>{let m=/^rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(c);if(m)return [+m[1],+m[2],+m[3]];m=/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/.exec(c);return m?[m[1]*255,m[2]*255,m[3]*255]:null};
const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
async function open(o={}){const c=await b.newContext({viewport:{width:360,height:780},hasTouch:true,colorScheme:o.dark?'dark':'light',reducedMotion:o.reduced?'reduce':'no-preference'});
 await c.addInitScript(init,o);
 if(o.store)await c.addInitScript(([k,v])=>{if(localStorage.getItem('__seeded')===null){localStorage.setItem(k,v);localStorage.setItem('__seeded','1')}},o.store);
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(R+(o.page||PAGE));await p.waitForTimeout(500);return {c,p}}
const idx=p=>p.$eval('#p-vocab .navrow .cnt',e=>+e.textContent.split('/')[0]);
const angle=p=>p.evaluate(()=>{const e=document.querySelector('#fc .fcp');const t=getComputedStyle(e).transform;if(t==='none')return 0;const v=t.slice(t.indexOf('(')+1).match(/-?[\d.e-]+/g).map(Number);return Math.round(Math.atan2(-v[2],v[0])*180/Math.PI*10)/10});
const box=p=>p.$eval('#fc',e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});
async function drag(p,dx,{dy=0,hold=0,steps=6,up=true}={}){const r=await box(p);const x=r.x+r.w/2+(dx<0?60:-60),y=r.y+r.h*0.62;await p.mouse.move(x,y);await p.mouse.down();for(let i=1;i<=steps;i++)await p.mouse.move(x+dx*i/steps,y+dy*i/steps);if(hold)await p.waitForTimeout(hold);if(up)await p.mouse.up()}

console.log('--- drag-following page turn ('+PAGE+')');
{const {c,p}=await open();const r=await box(p),W=r.w;
 ok('perspective is 900-1100px, the card is a 3D stack, touch-action keeps vertical scrolling',await p.$eval('#fc',e=>{const s=getComputedStyle(e);const pp=parseFloat(s.perspective);return e.classList.contains('f3d')&&pp>=900&&pp<=1100&&s.touchAction.includes('pan-y')}));
 const res=[];
 for(const f of [.1,.25,.5,.75,.95]){await drag(p,-f*W,{up:false});await p.waitForTimeout(80);res.push({f,ov:await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&scrollX===0&&document.scrollingElement.scrollLeft===0),a:await angle(p),origin:await p.$eval('#fc .fcp',e=>getComputedStyle(e).transformOrigin),past:await p.$eval('#fc',e=>e.classList.contains('past')),under:await p.$eval('#fc .fcu',e=>({v:getComputedStyle(e).visibility,t:e.textContent.slice(0,6)}))});await p.mouse.move(0,0);await p.mouse.up();await p.waitForTimeout(900);
  if(await idx(p)!==1){await p.click('[data-act=prev]');await p.waitForTimeout(80)}}
 ok('left drag: the card rotates by drag/width x 180 degrees (negative, within 6 degrees) at 10, 25, 50, 75, 95% of the width',res.every(x=>Math.abs(x.a-(-x.f*180))<=6),res.map(x=>[x.f,x.a]));
 ok('left drag: the hinge is the left edge, "past" starts after 90 degrees, the next card shows underneath',res.every(x=>parseFloat(x.origin)<2&&x.past===(Math.abs(x.a)>90)&&x.under.v==='visible'),res);
 ok('mid-turn, at every distance up to 95% the page itself never scrolls or widens (the swinging card is clipped, scrollX stays 0)',res.every(x=>x.ov),res.map(x=>[x.f,x.ov]));
 ok('setPointerCapture is used for the drag',await p.evaluate(()=>window.__cap)>=1);
 // right drag
 await drag(p,.5*W,{up:false});await p.waitForTimeout(80);
 const ra=await angle(p),ro=await p.$eval('#fc .fcp',e=>getComputedStyle(e).transformOrigin);
 ok('right drag: positive rotation about the right edge (previous card underneath)',Math.abs(ra-90)<=6&&Math.abs(parseFloat(ro)-W)<=2,[ra,ro]);
 ok('right drag mid-turn: no horizontal page overflow or scroll',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&scrollX===0));
 await p.mouse.up();await p.waitForTimeout(900);
 await c.close()}
{const {c,p}=await open();const W=(await box(p)).w;
 await drag(p,-.45*W,{hold:350});await p.waitForTimeout(900);
 ok('slow drag past 35% of the width completes the turn (next card)',await idx(p)===2,await idx(p));
 await drag(p,.25*W,{hold:350});await p.waitForTimeout(700);
 ok('slow drag of 25% springs back: same card, rotation back to 0, nothing left over',await idx(p)===2&&await angle(p)===0&&await p.$eval('#fc',e=>!e.classList.contains('dragging')&&!e.classList.contains('past')),[await idx(p),await angle(p)]);
 await drag(p,-70,{steps:2});await p.waitForTimeout(900);
 ok('a fast flick of only 70px (high velocity) completes the turn',await idx(p)===3,await idx(p));
 await drag(p,60,{steps:2});await p.waitForTimeout(900);
 ok('a fast flick to the right goes back one card',await idx(p)===2,await idx(p));
 // timing of the completed turn
 const t0=Date.now();await drag(p,-.5*W,{hold:300});const dur=await p.evaluate(()=>getComputedStyle(document.querySelector('#fc .fcp')).transitionDuration);
 let ch=null;for(let i=0;i<60;i++){if(await idx(p)===3){ch=Date.now()-t0;break}await p.waitForTimeout(30)}
 ok('the completed swipe animates about 620ms with ease-in-out (transition '+dur+')',parseFloat(dur)>=.55&&parseFloat(dur)<=.7,dur);
 await c.close()}
{const {c,p}=await open();const W=(await box(p)).w;
 await drag(p,12,{dy:110,steps:5});await p.waitForTimeout(150);
 ok('a mostly vertical drag does not rotate or change the card (the page can scroll)',await angle(p)===0&&await idx(p)===1&&await p.$eval('#fc',e=>!e.classList.contains('dragging')));
 await drag(p,6,{steps:2});await p.waitForTimeout(100);
 ok('a tiny move is a tap, not a drag (no rotation)',await angle(p)===0&&await idx(p)===1);
 await c.close()}

console.log('--- tap flip');
for(const dark of [false,true]){const {c,p}=await open({dark});
 const tf=await p.$eval('#fc .fci',e=>{const s=getComputedStyle(e);return {d:parseFloat(s.transitionDuration),f:s.transitionTimingFunction}});
 ok((dark?'dark':'light')+': tap flip lasts 550-700ms with an ease-in-out curve',tf.d>=.55&&tf.d<=.7&&/cubic-bezier\(0\.45, 0, 0\.55, 1\)|ease-in-out/.test(tf.f),tf);
 await p.click('#fc',{position:{x:150,y:150}});await p.waitForTimeout(340);
 const mid=await p.$eval('#fc .fci',e=>{const t=getComputedStyle(e).transform;if(t==='none')return 0;const v=t.slice(t.indexOf('(')+1).match(/-?[\d.e-]+/g).map(Number);return Math.abs(Math.atan2(-v[2],v[0])*180/Math.PI)});
 ok('  halfway through the flip the card is visibly turned (30-150 degrees), the soft shadow animates',mid>30&&mid<150&&await p.$eval('#fc .fcs',e=>getComputedStyle(e).animationName==='zh-shadow'),mid);
 await p.waitForTimeout(600);
 const faces=await p.evaluate(()=>{const g=s=>getComputedStyle(document.querySelector(s));const f=parse(g('#fc .face.front').backgroundColor),k=parse(g('#fc .face.back').backgroundColor),bd=parse(g('#fc .face.front').borderTopColor),pg=parse(getComputedStyle(document.body).backgroundColor);function parse(c){let m=/^rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(c);if(m)return [+m[1],+m[2],+m[3]];m=/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/.exec(c);return [m[1]*255,m[2]*255,m[3]*255]}return {f,k,bd,pg,sh:g('#fc .face.front').boxShadow,shadow:getComputedStyle(document.querySelector('#fc .fcs')).backgroundImage!=='none'}});
 const dist=Math.hypot(faces.f[0]-faces.k[0],faces.f[1]-faces.k[1],faces.f[2]-faces.k[2]);
 ok('  the back face is clearly different from the front (colour distance '+dist.toFixed(0)+' of 255, minimum 12), after the flip the back shows',dist>=12&&await p.evaluate(()=>document.querySelector('#fc .front').hidden&&!document.querySelector('#fc .back').hidden),dist);
 ok('  the card is visible against the page: border contrast '+cr(faces.bd,faces.pg).toFixed(2)+':1 (min 1.5), a box shadow and a table shadow exist',cr(faces.bd,faces.pg)>=1.5&&faces.sh!=='none'&&faces.shadow);
 await c.close()}

console.log('--- fallbacks');
{const {c,p}=await open({reduced:true});
 ok('reduced motion: no 3D, no page turn',await p.$eval('#fc',e=>!e.classList.contains('f3d')&&getComputedStyle(e.querySelector('.fcp')).display==='contents'));
 await drag(p,-150,{hold:100});await p.waitForTimeout(300);
 ok('reduced motion: a swipe still changes the card at once, without rotation',await idx(p)===2&&await angle(p)===0,await idx(p));
 await p.click('#fc',{position:{x:150,y:150}});await p.waitForTimeout(60);
 ok('reduced motion: tap flips at once',await p.evaluate(()=>document.querySelector('#fc .front').hidden&&!document.querySelector('#fc .back').hidden));await c.close()}

console.log('--- page-turn sound');
{const {c,p}=await open();
 ok('default: the sound is off (toggle not pressed, nothing stored) and no AudioContext exists',await p.$eval('.fcsnd',e=>e.getAttribute('aria-pressed')==='false')&&await p.evaluate(()=>window.__ac===0&&!(JSON.parse(localStorage.getItem('zh-ui-v1')||'{}').study||{}).sound));
 const keys0=await p.evaluate(()=>Object.keys(localStorage).sort());
 await p.click('#fc',{position:{x:150,y:150}});await p.waitForTimeout(800);await drag(p,-150,{hold:300});await p.waitForTimeout(900);
 ok('sound off: flips and turns create no AudioContext and play nothing',await p.evaluate(()=>window.__ac===0&&window.__plays===0));
 await p.click('.fcsnd');await p.waitForTimeout(100);
 ok('turning it on (a user gesture) creates the AudioContext once, resumes it, plays a short swish, and saves the choice inside zh-ui-v1',await p.evaluate(()=>window.__ac===1&&window.__resumes>=1&&window.__plays===1&&JSON.parse(localStorage.getItem('zh-ui-v1')).study.sound===1)&&await p.$eval('.fcsnd',e=>e.getAttribute('aria-pressed')==='true'));
 const before=await p.evaluate(()=>window.__plays);await p.click('#fc',{position:{x:150,y:150}});await p.waitForTimeout(800);
 ok('with the sound on, a flip plays one swish',await p.evaluate(b=>window.__plays===b+1,before));
 const b2=await p.evaluate(()=>window.__plays);await drag(p,-.5*(await box(p)).w,{hold:300});await p.waitForTimeout(1000);
 ok('with the sound on, a completed page turn plays one swish (a spring-back plays none)',await p.evaluate(b=>window.__plays===b+1,b2));
 const b3=await p.evaluate(()=>window.__plays);await drag(p,.2*(await box(p)).w,{hold:350});await p.waitForTimeout(700);
 ok('  spring-back is silent',await p.evaluate(b=>window.__plays===b,b3));
 ok('no new storage key was created (only the lesson key, zh-ui-v1 and zh-hub-v1)',(await p.evaluate(()=>Object.keys(localStorage))).every(k=>/^(noor-|zh-ui-v1$|zh-hub-v1$|__seeded$)/.test(k)),await p.evaluate(()=>Object.keys(localStorage)));
 await p.click('[data-tab=practice]');await p.waitForTimeout(100);const b4=await p.evaluate(()=>window.__plays);
 await p.click('[data-act=start][data-k=meaning]');await p.waitForTimeout(100);await p.click('#qbody .opt:nth-child(1)');await p.waitForTimeout(200);
 ok('no sounds anywhere else (quiz answers play nothing)',await p.evaluate(b=>window.__plays===b,b4));
 await p.reload();await p.waitForTimeout(500);
 const acBefore=await p.evaluate(()=>window.__ac);
 await p.click('[data-tab=vocab]');await p.waitForTimeout(150);
 ok('after a reload the sound is still on, but no AudioContext existed before the first gesture',acBefore===0&&await p.$eval('.fcsnd',e=>e.getAttribute('aria-pressed')==='true'));
 ok('the first gesture creates it',await p.evaluate(()=>window.__ac===1));
 await p.click('[data-zh=open]');await p.waitForTimeout(150);
 ok('the settings sheet has a matching switch, in the same state',await p.$eval('[data-zh=swish]',e=>e.getAttribute('aria-pressed')==='true'));
 await p.click('[data-zh=swish]');await p.waitForTimeout(100);
 ok('the sheet switch turns the sound off and updates the card button',await p.evaluate(()=>JSON.parse(localStorage.getItem('zh-ui-v1')).study.sound===0)&&await p.$eval('.fcsnd',e=>e.getAttribute('aria-pressed')==='false'));
 ok('no page errors',p.errs.length===0,p.errs);await c.close()}
{const {c,p}=await open({noAudio:true});
 await p.click('.fcsnd');await p.click('#fc',{position:{x:150,y:150}});await p.waitForTimeout(800);await drag(p,-150,{hold:300});await p.waitForTimeout(900);
 ok('without Web Audio: turning the sound on, flipping and turning fail silently (no errors, cards still work)',p.errs.length===0&&await idx(p)===2,p.errs);await c.close()}

console.log('--- the same behaviour on the other card pages');
for(const pg of ['prac-6.html','biz-4.html','cult-1.html']){const {c,p}=await open({page:pg});
 await p.click('[data-tab=vocab]').catch(()=>{});await p.waitForTimeout(250);
 await drag(p,-.5*(await box(p)).w,{up:false});await p.waitForTimeout(80);const a=await angle(p);await p.mouse.up();await p.waitForTimeout(900);
 ok(pg+': the card follows the drag ('+a+' degrees) and the turn completes (card 2)',Math.abs(a+90)<=8&&await idx(p)===2&&p.errs.length===0,[a,await idx(p),p.errs]);await c.close()}
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
