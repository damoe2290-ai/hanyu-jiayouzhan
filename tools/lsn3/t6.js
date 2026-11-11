/* Typing-tools test: delete one character/syllable, undo, clear-all (zh-ui.js), canvas stroke undo, order-chip undo.
   PAGE_PREFIX= node t6.js lesson-9.html cult-2.html     (run from the repo root; see tools/README.md for the variables)
   The browser is a touch device with a SHORT viewport (390x340) to emulate the visible area left when a phone's
   on-screen keyboard is open. Real on-screen keyboards (iOS / Android) cannot be driven from here; this checks layout,
   touch taps, focus retention and the editing logic, not the keyboard itself. */
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright']){try{({chromium}=require(m));break}catch(e){}}
const fs=require('fs');const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const PFX=process.env.PAGE_PREFIX===undefined?'w-':process.env.PAGE_PREFIX;
let fails=0;const ok=(name,cond,extra)=>{console.log((cond?'ok   ':'FAIL ')+name+(extra?'  '+extra:''));if(!cond)fails++};
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
for(const f of process.argv.slice(2)){
  const ctx=await b.newContext({viewport:{width:390,height:340},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/'+PFX+f);await p.waitForTimeout(400);
  console.log('--- '+f+' (390x340, touch)');
  await p.tap('[data-tab=practice]');
  const hasWrite=await p.$('.act[data-k=write]');
  if(!hasWrite)console.log('(no write-and-speak activity in this lesson: typing-field checks skipped)');
  if(hasWrite){
  await p.tap('.act[data-k=write]');await p.waitForTimeout(200);
  const ta='[data-wta="0"]',bar='[data-wta="0"] + .zh-ed';
  ok('toolbar built under each writing field',(await p.$$eval('[data-wta] + .zh-ed',e=>e.length))===(await p.$$eval('[data-wta]',e=>e.length)));
  ok('toolbar has delete / undo / clear-all',await p.$$eval(bar+' button',e=>e.length)===3);
  const sizes=await p.$$eval(bar+' button',e=>e.map(x=>{const r=x.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)}));
  ok('toolbar buttons are at least 44px',(await p.$$eval(bar+' button',e=>e.every(x=>{const r=x.getBoundingClientRect();return r.width>=43.5&&r.height>=43.5}))),sizes.join(' '));
  // reachable with the keyboard-height viewport: nothing covers the buttons after scrolling them into view
  await p.focus(ta);await p.evaluate(()=>document.querySelector('[data-wta="0"] + .zh-ed').scrollIntoView({block:'center'}));await p.waitForTimeout(150);
  const reach=await p.$$eval(bar+' button',e=>e.map(x=>{const r=x.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;const t=document.elementFromPoint(cx,cy);return cy>0&&cy<innerHeight&&(t===x||x.contains(t))}));
  ok('buttons visible and not covered (short viewport)',reach.every(Boolean),JSON.stringify(reach));
  // the goal-reached toast appears while typing: it must not cover the toolbar (short viewport = keyboard open)
  await p.focus(ta);await p.fill(ta,'我每天六点半起床，然后吃早饭，下午去图书馆看书，晚上学习汉语。'.repeat(3));  /* long enough for every lesson's goal (12 or 40 characters) */await p.waitForTimeout(250);
  const toast=await p.evaluate(()=>{const t=document.querySelector('#toast'),bar=document.querySelector('[data-wta="0"] + .zh-ed');if(!t||t.hidden)return {shown:false};
    const a=t.getBoundingClientRect(),bb=bar.getBoundingClientRect();return {shown:true,overlaps:!(a.bottom<=bb.top||a.top>=bb.bottom||a.right<=bb.left||a.left>=bb.right),blocksTaps:getComputedStyle(t).pointerEvents!=='none'}});
  ok('goal toast is shown while typing',toast.shown);
  ok('toast does not overlap the toolbar and never blocks taps',toast.shown&&!toast.overlaps&&!toast.blocksTaps,JSON.stringify(toast));
  // one-step backspace, focus stays in the field (keyboard stays open)
  await p.fill(ta,'今天天气很好');
  await p.tap(bar+' [data-zh-ed=bs]');
  ok('backspace deletes ONE character',await p.$eval(ta,e=>e.value)==='今天天气很');
  ok('field keeps focus after a toolbar tap',await p.evaluate(()=>document.activeElement&&document.activeElement.hasAttribute('data-wta')));
  await p.tap(bar+' [data-zh-ed=bs]');await p.tap(bar+' [data-zh-ed=bs]');
  ok('three backspaces = three characters',await p.$eval(ta,e=>e.value)==='今天天');
  // selection is deleted as a whole, caret position respected
  await p.evaluate(s=>{const e=document.querySelector(s);e.focus();e.setSelectionRange(0,2)},ta);await p.tap(bar+' [data-zh-ed=bs]');
  ok('backspace removes the selection (2 selected characters)',await p.$eval(ta,e=>e.value)==='天');
  // phrase chip insert is one undoable step
  await p.fill(ta,'你好');
  const before=await p.$eval(ta,e=>e.value);
  await p.tap('[data-act=wfr]');const afterChip=await p.$eval(ta,e=>e.value);
  ok('phrase chip inserted text',afterChip.length>before.length,afterChip);
  await p.tap(bar+' [data-zh-ed=undo]');
  ok('undo removes the whole inserted phrase in one step',await p.$eval(ta,e=>e.value)===before);
  // clear all, then undo restores it
  await p.tap(bar+' [data-zh-ed=clear]');ok('clear-all empties the field',await p.$eval(ta,e=>e.value)==='');
  ok('buttons disabled when empty',await p.$eval(bar+' [data-zh-ed=bs]',e=>e.disabled));
  await p.tap(bar+' [data-zh-ed=undo]');ok('undo restores after clear-all',await p.$eval(ta,e=>e.value)===before);
  // page state follows (the lesson stores what was typed)
  ok('lesson state counter follows the field',(await p.$eval('[data-wcc="0"]',e=>e.textContent))==String(before.length));
  // surrogate pair counts as one character
  await p.fill(ta,'a\u{20000}');await p.tap(bar+' [data-zh-ed=bs]');
  ok('a rare character outside the BMP is deleted as one character',await p.$eval(ta,e=>e.value)==='a');
  // pinyin mode (used by the typed-answer exercises): one SYLLABLE per step
  await p.evaluate(()=>{const t=document.createElement('textarea');t.id='pyt';t.setAttribute('data-zh-editor','pinyin');document.querySelector('#p-practice').appendChild(t)});
  await p.waitForTimeout(150);
  const pyBar='#pyt + .zh-ed';ok('pinyin field gets the toolbar too (label says syllable)',(await p.$eval(pyBar+' [data-zh-ed=bs]',e=>e.textContent))==='حذف مقطع');
  for(const [typed,expect] of [['nǐhǎo','nǐ'],['ni3hao3','ni3'],['xiàwǔ','xià'],['zhōngguó','zhōng'],['Wáng Xiǎoyún','Wáng Xiǎo'],['nǚ','']]){
    await p.fill('#pyt',typed);await p.tap(pyBar+' [data-zh-ed=bs]');
    const got=await p.$eval('#pyt',e=>e.value);ok('pinyin "'+typed+'" -> one syllable removed -> "'+expect+'"',got===expect,got===expect?'':'got "'+got+'"');}
  await p.evaluate(()=>{document.querySelector('#pyt').remove();document.querySelector('#pyt + .zh-ed')&&document.querySelector('#pyt + .zh-ed').remove()});
  }
  if(!/cult/.test(f)){
    // writing canvas: undo ONE stroke vs clear all (normal-height viewport: no keyboard is open while drawing, and the
    // 340px canvas would sit under the sticky header in the short one, so strokes would never reach it)
    await p.setViewportSize({width:390,height:844});
    await p.tap('[data-act=qexit]').catch(()=>{});await p.tap('[data-tab=writing]');await p.waitForTimeout(200);
    const snap=()=>p.$eval('#cv',c=>c.toDataURL());
    const s0=await snap();const box=await p.$eval('#cv',c=>{const r=c.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}});
    await p.evaluate(()=>document.querySelector('#cv').scrollIntoView({block:'center'}));
    const b2=await p.$eval('#cv',c=>{const r=c.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}});
    const stroke=async(i)=>{await p.mouse.move(b2.x+30+i*40,b2.y+30);await p.mouse.down();await p.mouse.move(b2.x+60+i*40,b2.y+b2.h-40,{steps:4});await p.mouse.up()};
    await stroke(0);const s1=await snap();await stroke(1);const s2=await snap();await stroke(2);const s3=await snap();
    ok('three strokes change the canvas (precondition of the undo checks)',new Set([s0,s1,s2,s3]).size===4);
    await p.evaluate(()=>document.querySelector('[data-act=wundo]').click());
    ok('undo removes exactly the last stroke',await snap()===s2);
    await p.evaluate(()=>document.querySelector('[data-act=wundo]').click());
    ok('undo again goes back one more stroke',await snap()===s1);
    await p.evaluate(()=>document.querySelector('[data-act=wclear]').click());
    ok('clear-all removes every stroke',await snap()===s0);
    // order chips
    await p.tap('[data-tab=practice]');await p.tap('.act[data-k=order]');await p.waitForTimeout(200);
    const n=async()=>p.$$eval('#qbody .slot .chip',e=>e.length);
    for(let i=0;i<3;i++)await p.evaluate(()=>document.querySelector('#qbody .pool [data-act=pick]').click());
    ok('three chips placed',await n()===3);
    ok('remove-last/clear buttons enabled with chips placed',await p.$eval('[data-act=unpicklast]',e=>!e.disabled));
    await p.evaluate(()=>document.querySelector('[data-act=unpicklast]').click());ok('remove-last removes ONE chip',await n()===2);
    await p.evaluate(()=>document.querySelector('[data-act=unpickall]').click());ok('clear removes all chips',await n()===0);
    ok('buttons disabled when nothing is placed',await p.$eval('[data-act=unpicklast]',e=>e.disabled));
    ok('lesson links are hidden during a quiz question',await p.$eval('.zh-lnav',e=>getComputedStyle(e).display)==='none');
    await p.evaluate(()=>document.querySelector('[data-act=qexit]').click());await p.waitForTimeout(150);
    ok('lesson links are back after leaving the quiz',await p.$eval('.zh-lnav',e=>getComputedStyle(e).display)!=='none');
  }
  ok('no page errors',errs.length===0,errs.join(' | '));
  await ctx.close();
}
await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
