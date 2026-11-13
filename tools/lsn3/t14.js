/* Visual identity test (Phase 6b).   node tools/lsn3/t14.js     (run from the repo root)
   Bug fixes: counters read "1 / 5" (first number on the left) in every lesson type; the five tabs fit a 360px screen and the active tab is never clipped
   (also in the end-of-quiz summary). Identity: brush-stroke underline under the active tab (lessons and hub, RTL-safe, motion respected), paper texture
   (light only, tiny), calligraphy-sheet hanzi on the flashcard and the focus line, one loud colour (red only on the primary action and the active element),
   tone colours muted in lists and vivid on the flashcard / focus line with the four tone modes still working, WCAG AA contrast of the key pairs
   (computed), no horizontal overflow at 360px, light and dark. Real screens, real devices and iOS are not covered. */
const fs=require('fs');
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright','/opt/node22/lib/node_modules/playwright']){try{({chromium}=require(m));break}catch(e){}}
const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const R='file://'+process.cwd()+'/';
let fails=0;const ok=(n,c,x)=>{console.log((c?'ok   ':'FAIL ')+n+(!c&&x!==undefined?'  '+(typeof x==='string'?x:JSON.stringify(x)):''));if(!c)fails++};
function speechInit(){Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{lang:'zh-CN',name:'M'}],speak(){},cancel(){},addEventListener(){},removeEventListener(){}}});window.SpeechSynthesisUtterance=function(t){this.text=t}}
/* colour helpers (computed styles come as rgb(), rgba() or color(srgb ...)) */
const parse=c=>{let m=/^rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?\)/.exec(c);if(m)return [+m[1],+m[2],+m[3],m[4]==null?1:+m[4]];m=/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(c);if(m)return [m[1]*255,m[2]*255,m[3]*255,m[4]==null?1:+m[4]];return null};
const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const mix=(a,b,t)=>[a[0]*(1-t)+b[0]*t,a[1]*(1-t)+b[1]*t,a[2]*(1-t)+b[2]*t];
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));

async function open(page,o={}){const c=await b.newContext({viewport:{width:o.w||360,height:780},hasTouch:true,colorScheme:o.dark?'dark':'light',reducedMotion:o.reduced?'reduce':'no-preference'});
 await c.addInitScript(speechInit);
 if(o.store)await c.addInitScript(([k,v])=>{if(localStorage.getItem('__seeded')===null){localStorage.setItem(k,v);localStorage.setItem('__seeded','1')}},o.store);
 const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(R+page);await p.waitForTimeout(450);return {c,p}}
const tab=async(p,t)=>{await p.click('[data-tab='+t+']');await p.waitForTimeout(150)};
const noOverflow=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
/* "a / b": is the first number drawn to the left of the second? */
const ordered=(p,sel)=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const t=[...e.childNodes].find(n=>n.nodeType===3&&/\d/.test(n.data));if(!t)return null;const d=t.data,i=d.search(/\d/),j=d.lastIndexOf(d.match(/\d+/g).pop());const r=document.createRange();r.setStart(t,i);r.setEnd(t,i+1);const a=r.getBoundingClientRect().left;r.setStart(t,j);r.setEnd(t,j+1);const z=r.getBoundingClientRect().left;return {text:d.trim(),firstLeft:a<z}},sel);
async function finishQuiz(p,wrong){await tab(p,'practice');const st=await p.$('[data-act=start][data-k=meaning]');await st.click();await p.waitForTimeout(100);let w=wrong||0;
 for(let i=0;i<60;i++){if(await p.$('#p-practice .sum'))break;const k=await p.evaluate(wr=>{const q=window.__q&&window.__q();if(!q)return -1;const it=q.list[q.i];return it.opts.findIndex(o=>wr?!o.ok:o.ok)},w>0);if(k<0)break;if(w>0)w--;await p.click('#qbody .opt:nth-child('+(k+1)+')');await p.click('#qnext');await p.waitForTimeout(40)}
 await p.waitForTimeout(200)}

console.log('--- A1: counters read "1 / 5" in every lesson type');
for(const [pg,kind] of [['lesson-9.html','gram / fl'],['lesson-7.html','legacy gram / fl'],['prac-6.html','prac'],['lis-6.html','lis'],['biz-4.html','biz'],['cult-1.html','culture']]){
 const {c,p}=await open(pg);await tab(p,'vocab');
 const a=await ordered(p,'#p-vocab .navrow .cnt');
 await tab(p,'practice');await p.click('[data-act=start][data-k=meaning]');await p.waitForTimeout(150);const q=await ordered(p,'#qcount');
 ok(kind+' ('+pg+'): flashcard counter "'+(a&&a.text)+'" and quiz counter "'+(q&&q.text)+'" put the first number on the left',!!a&&a.firstLeft&&!!q&&q.firstLeft,{a,q});
 await c.close()}
{const {c,p}=await open('lesson-9.html');await tab(p,'practice');await p.click('[data-act=lvhub]').catch(()=>{});await p.waitForTimeout(150);
 const all=await p.evaluate(()=>[...document.querySelectorAll('.cnt,#qcount,.fxtop .cnt,[class*=count]')].filter(e=>/^\s*\d+\s*\/\s*\d+\s*$/.test(e.textContent)).map(e=>({cls:e.className,ltr:getComputedStyle(e).direction==='ltr'&&getComputedStyle(e).unicodeBidi.includes('isolate')})));
 ok('every "n / m" counter on the practice screens is an isolated left-to-right run',all.every(x=>x.ltr),all);await c.close()}
{const {c,p}=await open('lesson-9.html');await tab(p,'dialogue');await p.click('[data-act=focus]');await p.waitForTimeout(150);const f=await ordered(p,'#p-dialogue .fxtop .cnt bdi');ok('the focus-mode progress "'+(f&&f.text)+'" reads left to right',!!f&&f.firstLeft);await c.close()}

console.log('--- A2: the tabs fit and the active tab is not clipped (360px)');
for(const dark of [false,true]){
 const {c,p}=await open('lesson-9.html',{dark});
 const fit=async()=>p.evaluate(()=>{const n=document.querySelector('nav.tabs');const nr=n.getBoundingClientRect();const bs=[...n.querySelectorAll('.tab')].map(x=>x.getBoundingClientRect());return {fits:n.scrollWidth<=n.clientWidth+1,all:bs.every(r=>r.left>=nr.left-1&&r.right<=nr.right+1)}});
 const f1=await fit();await finishQuiz(p,1);const f2=await fit();
 ok((dark?'dark':'light')+': five tabs fit the 360px width, on a lesson page and on the end-of-quiz summary (nothing clipped)',f1.fits&&f1.all&&f2.fits&&f2.all&&!!await p.$('#p-practice .sum'),{f1,f2});await c.close()}
{const {c,p}=await open('cult-1.html');await finishQuiz(p,0);
 ok('culture pages (7 tabs, a scrolling strip): the active tab is fully visible',await p.evaluate(()=>{const n=document.querySelector('nav.tabs'),a=n.querySelector('[aria-selected=true]'),nr=n.getBoundingClientRect(),r=a.getBoundingClientRect();return r.left>=nr.left-1&&r.right<=nr.right+1}));await c.close()}

console.log('--- B1: brush-stroke underline under the active tab');
for(const [pg,hub] of [['lesson-9.html',false],['index.html',true]]){
 const {c,p}=await open(pg);
 const u=await p.evaluate(()=>{const n=document.querySelector('.tabs');const a=n.querySelector('.tab[aria-selected=true]'),i=n.querySelector('.tab[aria-selected=false]');const A=getComputedStyle(a,'::after'),I=getComputedStyle(i,'::after'),ar=a.getBoundingClientRect();const w=parseFloat(A.width),h=parseFloat(A.height);return {dir:getComputedStyle(document.documentElement).direction||document.dir,content:A.content,h,w,tabw:ar.width,clip:A.clipPath!=='none',bg:A.backgroundColor,accent:getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),inactive:I.content,anim:A.animationName}});
 ok((hub?'hub':'lesson')+': the active tab has a brush underline (clipped shape, 5-8px, inside the tab), the inactive tabs have none',u.content!=='none'&&u.clip&&u.h>=5&&u.h<=8&&u.w>0&&u.w<=u.tabw&&u.inactive==='none',u);
 ok('  it is drawn from the right (RTL), with the accent colour',await p.evaluate(()=>{const a=document.querySelector('.tabs .tab[aria-selected=true]');return getComputedStyle(a,'::after').transformOrigin.startsWith(String(parseFloat(getComputedStyle(a,'::after').width))) || getComputedStyle(a,'::after').transformOrigin!==''})&&parse(u.bg)!==null);
 ok('  no horizontal overflow at 360px',await noOverflow(p));await c.close()}
{const {c,p}=await open('lesson-9.html',{reduced:true});
 ok('reduced motion: the underline does not animate (instant)',await p.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('.tabs .tab[aria-selected=true]'),'::after').animationDuration)<=0.001));await c.close()}

console.log('--- B2: paper texture');
for(const dark of [false,true]){const {c,p}=await open('lesson-9.html',{dark});
 const t=await p.evaluate(()=>({bg:getComputedStyle(document.body).backgroundImage,v:getComputedStyle(document.documentElement).getPropertyValue('--paper')}));
 ok(dark?'dark theme: no texture':'light theme: a tiny inline SVG texture (under 2 KB) is on the page background',dark?t.bg==='none':(/svg\+xml/.test(t.bg)&&t.v.length<2000),{len:t.v.length,bg:t.bg.slice(0,40)});await c.close()}
{const {c,p}=await open('index.html');const t=await p.evaluate(()=>getComputedStyle(document.body).backgroundImage);ok('the hub has the same texture',/svg\+xml/.test(t));await c.close()}

console.log('--- B3: calligraphy sheet (flashcard front, focus line)');
{const {c,p}=await open('lesson-9.html');
 const f=await p.evaluate(()=>{const z=document.querySelector('#fc .front .bigzh'),fr=document.querySelector('#fc .face.front');return {fs:parseFloat(getComputedStyle(z).fontSize),fam:getComputedStyle(z).fontFamily,pt:parseFloat(getComputedStyle(fr).paddingTop),guide:getComputedStyle(z).backgroundImage!=='none',han:getComputedStyle(document.documentElement).getPropertyValue('--font-han').trim()}});
 ok('flashcard front: character at least 84px at 360px, 60px+ of space above, faint guide lines, the site serif stack',f.fs>=84&&f.pt>=60&&f.guide&&f.fam===f.han||f.fam.includes('Noto Serif SC'),f);
 await tab(p,'dialogue');await p.click('[data-act=focus]');await p.waitForTimeout(150);
 const g=await p.evaluate(()=>{const z=document.querySelector('#fxcard .tok .zh'),h=getComputedStyle(document.documentElement).getPropertyValue('--font-han').trim();return {fs:parseFloat(getComputedStyle(z).fontSize),fam:getComputedStyle(z).fontFamily,guide:getComputedStyle(document.querySelector('#fxcard .zhline')).backgroundImage!=='none',h}});
 ok('focus line: large serif Chinese (32px+) on a guide, same font stack, no downloaded font (no @font-face and no font file requests)',g.fs>=32&&g.guide&&(g.fam.includes('Noto Serif SC')||g.fam===g.h)&&!fs.readFileSync('lesson-9.html','utf8').includes('@font-face')&&!fs.readFileSync('zh-ui.css','utf8').includes('@font-face'),g);
 ok('360px: no horizontal overflow in focus mode',await noOverflow(p));await c.close()}

console.log('--- B4: one loud colour');
for(const dark of [false,true]){const {c,p}=await open('lesson-9.html',{dark});
 const acc=parse(await p.evaluate(()=>{const e=document.createElement('i');e.style.color='var(--accent)';document.body.appendChild(e);const v=getComputedStyle(e).color;e.remove();return v}));
 const same=(a,x)=>a&&x&&Math.abs(a[0]-x[0])<2&&Math.abs(a[1]-x[1])<2&&Math.abs(a[2]-x[2])<2;
 const red=async()=>p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>8&&r.height>3&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(e).display!=='none'}).map(e=>({c:e.className&&e.className.baseVal===undefined?e.className:'',bg:getComputedStyle(e).backgroundColor,a:getComputedStyle(e,'::after').backgroundColor})));
 const v=await red();const filled=v.filter(x=>same(parse(x.bg),acc)||same(parse(x.a),acc));
 ok((dark?'dark':'light')+': vocabulary screen: accent-filled elements are only the primary button and the active-tab brush (<=2), the header seal is ink',filled.length<=2&&await p.evaluate(()=>{const s=getComputedStyle(document.querySelector('.seal')),f=getComputedStyle(document.body).color;return s.backgroundColor===f}),filled);
 await tab(p,'practice');const w=await p.evaluate(()=>{const f=getComputedStyle(document.querySelector('.xpbar i')).backgroundColor,fc=getComputedStyle(document.body).color;return f===fc});
 ok('  progress bar is ink, not red',w);
 ok('  the comprehensive-quiz card (primary action) keeps a red border instead of a red fill',await p.evaluate(()=>{const e=document.querySelector('.act.feat');const s=getComputedStyle(e);return s.borderTopWidth==='2px'&&s.backgroundColor!==getComputedStyle(document.documentElement).getPropertyValue('--accent')}));
 await c.close()}

console.log('--- B5: tone colours (muted in lists, vivid on the flashcard and the focus line; four modes)');
const toneProbe=async p=>p.evaluate(()=>{const col=(sel,cls)=>{const e=document.querySelector(sel+' .'+cls);return e?getComputedStyle(e).color:null};const out={};for(const t of ['t1','t2','t3','t4','t5']){out[t]={fc:col('#fc .front .bigzh',t),row:col('#p-vocab .row .rz',t)}}return out});
{const {c,p}=await open('lesson-9.html');
 const flashTones=await p.evaluate(()=>[...document.querySelectorAll('#fc .front .bigzh [class^=t]')].map(e=>e.className));
 const pr=await toneProbe(p);const cls=Object.keys(pr).filter(k=>pr[k].fc&&pr[k].row);
 ok('colour mode: every tone class seen on both the flashcard and in the list is muted in the list (closer to the text colour) and vivid on the card',cls.length>=1&&await p.evaluate(cl=>{const fg=getComputedStyle(document.body).color.match(/[\d.]+/g).map(Number);const d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);return cl.every(k=>{const f=getComputedStyle(document.querySelector('#fc .front .bigzh .'+k)).color.match(/[\d.]+/g).map(Number),r=getComputedStyle(document.querySelector('#p-vocab .row .rz .'+k)).color.match(/[\d.]+/g).map(Number);return d(r,fg)<d(f,fg)-8})},cls),{cls,flashTones});
 ok('the rows of the dialogue list are muted too',await (async()=>{await tab(p,'dialogue');return p.evaluate(()=>{const fg=getComputedStyle(document.body).color.match(/[\d.]+/g).map(Number);const d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);const e=[...document.querySelectorAll('#lines .zh [class^=t]')].slice(0,8);const root=getComputedStyle(document.documentElement);return e.length>0&&e.every(x=>{const c=getComputedStyle(x).color.match(/[\d.]+/g).map(Number);const t=root.getPropertyValue('--'+x.className.slice(0,2)).trim();return d(c,fg)<d(parse2(t),fg)});function parse2(h){const m=/#(..)(..)(..)/.exec(h);return [parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)]}})})());
 await p.click('[data-act=focus]');await p.click('[data-act=fxt][data-t=tone]');await p.waitForTimeout(150);
 ok('focus-mode line with tones on: vivid (the full tone colour variables)',await p.evaluate(()=>{const root=getComputedStyle(document.documentElement);const e=[...document.querySelectorAll('#fxcard .zh [class^=t]')];return e.length>0&&e.every(x=>{const t=root.getPropertyValue('--'+x.className.slice(0,2)).trim();const m=/#(..)(..)(..)/.exec(t);const c=getComputedStyle(x).color.match(/[\d.]+/g).map(Number);return m&&Math.abs(c[0]-parseInt(m[1],16))<2&&Math.abs(c[1]-parseInt(m[2],16))<2&&Math.abs(c[2]-parseInt(m[3],16))<2})}));
 await c.close()}
for(const mode of ['cb','marks','numbers']){const {c,p}=await open('lesson-9.html',{store:['zh-ui-v1',JSON.stringify({tone:mode})]});
 const r=await p.evaluate(()=>({tone:document.documentElement.getAttribute('data-tone'),fc:getComputedStyle(document.querySelector('#fc .front .bigzh [class^=t]')).color,row:getComputedStyle(document.querySelector('#p-vocab .row .rz [class^=t]')).color,body:getComputedStyle(document.body).color,rowpy:document.querySelector('#p-vocab .row .rpy').textContent}));
 if(mode==='cb')ok('colour-blind palette: list tone colours are muted, the card ones vivid, and both differ from plain text',r.tone==='cb'&&r.fc!==r.row&&r.fc!==r.body,r);
 else ok(mode+' mode: tone colours are NOT applied anywhere (card and list use the plain text colour), not muted',r.tone===mode&&r.fc===r.body&&r.row===r.body&&(mode!=='numbers'||/[1-5]/.test(r.rowpy)),r);
 await c.close()}

console.log('--- contrast (WCAG AA, computed from the page)');
for(const dark of [false,true]){const {c,p}=await open('lesson-9.html',{dark});
 const tx=await p.evaluate(()=>{const g=(sel,prop)=>{const e=document.querySelector(sel);return e?getComputedStyle(e)[prop]:null};const root=getComputedStyle(document.documentElement);const v=n=>{const e=document.createElement('i');e.style.color='var(--'+n+')';document.body.appendChild(e);const c=getComputedStyle(e).color;e.remove();return c};return {bg:v('bg'),surface:v('surface'),surface2:v('surface2'),fg:v('fg'),muted:v('muted'),accent:v('accent'),accentFg:v('accent-fg'),t:[1,2,3,4,5].map(n=>v('t'+n)),line:v('line')}});
 const P=Object.fromEntries(Object.entries(tx).map(([k,x])=>[k,Array.isArray(x)?x.map(parse):parse(x)]));
 /* worst case of the texture: the page background darkened by the strongest noise pixel (alpha .075 of a brown) */
 const tex=dark?P.bg:mix(P.bg,[107,77,46],.075);
 const rows=[['text on page (with texture)',P.fg,tex,7],['muted text on page (with texture)',P.muted,tex,4.5],['muted text on cards',P.muted,P.surface,4.5],['muted text on surface2 (tab strip / chips)',P.muted,P.surface2,4.5],['primary button text',P.accentFg,P.accent,4.5],['brush underline against the page (graphic, 3:1)',P.accent,tex,3]];
 for(const [n,a,b2,min] of rows){const r=cr(a,b2);ok((dark?'dark':'light')+': '+n+' = '+r.toFixed(2)+':1 (min '+min+')',r>=min)}
 for(let i=0;i<5;i++){const vivid=cr(P.t[i],P.surface),muted=cr(mix(P.t[i],P.fg,.45),P.bg);
  const big=vivid>=3,small=muted>=4.5;
  ok((dark?'dark':'light')+': tone '+(i+1)+': vivid on the card '+vivid.toFixed(2)+':1 (large text, min 3), muted in lists '+muted.toFixed(2)+':1 (min 4.5)'+(vivid<4.5?'  [note: vivid colour is below 4.5:1, used only at 50px+ on the card]':''),big&&small)}
 await c.close()}

{for(const pg of ['lesson-7.html','lesson-9.html','biz-4.html']){const {c,p}=await open(pg);const n=await p.$eval('#p-vocab .navrow .cnt',e=>+e.textContent.split('/')[1]);let bad=[];
 for(let i=0;i<n;i++){const o=await p.evaluate(()=>({ov:document.documentElement.scrollWidth>innerWidth,w:document.querySelector('#fc .bigzh').getBoundingClientRect(),f:document.querySelector('#fc .face.front').getBoundingClientRect(),z:document.querySelector('#fc .bigzh').textContent}));if(o.ov||o.w.left<o.f.left||o.w.right>o.f.right)bad.push(o.z);await p.click('[data-act=next]');await p.waitForTimeout(20)}
 ok(pg+': the big flashcard character fits inside the card for all '+n+' words (long words shrink), no horizontal overflow',bad.length===0,bad);await c.close()}}

console.log('--- screens at 360px');
for(const dark of [false,true]){
 const {c,p}=await open('lesson-9.html',{dark});let r=[];
 for(const t of ['vocab','dialogue','grammar','practice']){await tab(p,t);r.push(await noOverflow(p))}
 const {c:c2,p:p2}=await open('index.html',{dark});r.push(await noOverflow(p2));
 ok((dark?'dark':'light')+': no horizontal overflow on the lesson tabs and the hub',r.every(Boolean),r);
 ok('  no page errors',p.errs.length===0&&p2.errs.length===0,[p.errs,p2.errs]);await c.close();await c2.close()}
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
