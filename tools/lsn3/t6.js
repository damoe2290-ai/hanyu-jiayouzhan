/* Input test.  PAGE_PREFIX= node tools/lsn3/t6.js lesson-9.html cult-2.html ...   (run from the repo root; see tools/README.md)
   - Text fields (Write & speak boxes, future typed answers) use the phone's own keyboard: NO toolbar may be attached to them.
   - The hand-drawing canvas and the sentence-order questions have no system keyboard, so they keep their undo / clear buttons.
   - The goal toast must not block taps or cover the field; the previous/next lesson links are hidden during a quiz.
   - window.zhUI (pinyin helpers for tolerant grading) is unit-tested; it has no UI.
   The browser is a touch device with a SHORT viewport (390x340) to emulate the area left when a phone keyboard is open.
   A real iOS / Android keyboard cannot be driven from here. */
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
  const noBar=()=>p.evaluate(()=>document.querySelectorAll('.zh-ed,[data-zh-editor]').length===0&&[...document.querySelectorAll('textarea,input:not([type=checkbox]):not([type=radio])')].every(e=>!(e.nextElementSibling&&/zh-ed/.test(e.nextElementSibling.className))));
  await p.tap('[data-tab=practice]');
  const hasWrite=await p.$('.act[data-k=write]');
  if(!hasWrite)console.log('(no write-and-speak activity in this lesson: text-field checks skipped)');
  if(hasWrite){
    await p.tap('.act[data-k=write]');await p.waitForTimeout(200);
    const ta='[data-wta="0"]';
    ok('no toolbar on the writing fields',await noBar());
    await p.fill(ta,'你好');await p.tap('[data-act=wfr]');
    const v=await p.$eval(ta,e=>e.value);
    ok('phrase chip still inserts text into the field',v.length>2,v);
    ok('field keeps focus after a chip tap (keyboard stays open)',await p.evaluate(()=>document.activeElement&&document.activeElement.hasAttribute('data-wta')));
    ok('lesson counter follows the field',(await p.$eval('[data-wcc="0"]',e=>e.textContent))==String([...v].length)||(await p.$eval('[data-wcc="0"]',e=>e.textContent))==String(v.replace(/\s/g,'').length));
    ok('still no toolbar after typing and inserting',await noBar());
    // the goal toast must not block taps or cover the field
    await p.focus(ta);await p.fill(ta,'我每天六点半起床，然后吃早饭，下午去图书馆看书，晚上学习汉语。'.repeat(3));await p.waitForTimeout(250);
    const t=await p.evaluate(()=>{const t=document.querySelector('#toast'),f=document.querySelector('[data-wta="0"]');if(!t||t.hidden)return {shown:false};
      const a=t.getBoundingClientRect(),r=f.getBoundingClientRect();return {shown:true,overlaps:!(a.bottom<=r.top||a.top>=r.bottom||a.right<=r.left||a.left>=r.right),blocksTaps:getComputedStyle(t).pointerEvents!=='none'}});
    ok('goal toast is shown while typing',t.shown);
    ok('toast does not cover the field and never blocks taps',t.shown&&!t.overlaps&&!t.blocksTaps,JSON.stringify(t));
  }
  // an input added later (as Phase 2's typed answers will be) must not get a toolbar either
  await p.evaluate(()=>{const t=document.createElement('textarea');t.id='late';t.setAttribute('lang','zh');document.querySelector('#p-practice').appendChild(t);const i=document.createElement('input');i.id='late2';document.querySelector('#p-practice').appendChild(i)});
  await p.waitForTimeout(250);
  ok('fields added later get no toolbar',await noBar());
  await p.evaluate(()=>{document.querySelector('#late').remove();document.querySelector('#late2').remove()});
  // pinyin helpers (window.zhUI): used for tolerant grading, no UI
  const U=await p.evaluate(()=>{const z=window.zhUI;if(!z)return null;const eq=(a,b)=>z.normPinyin(a)===z.normPinyin(b);
    return {api:Object.keys(z).sort().join(','),
      same:[['nǐhǎo','ni3hao3'],['nǐ hǎo','Ni3 Hao3'],['lv4','lǜ'],['ma','ma5'],['Xi\'an','xian'],['shénme','shen2me']].map(x=>eq(x[0],x[1])),
      different:[['mā','má'],['nǐhǎo','nihao3']].map(x=>!eq(x[0],x[1])),
      syl:[['nǐhǎo',['nǐ','hǎo']],['xiàwǔ',['xià','wǔ']],['ni3hao3',['ni3','hao3']],['Wáng Xiǎoyún',['Wáng','Xiǎo','yún']],['zhōngguó',['zhōng','guó']]].map(x=>JSON.stringify(z.syllables(x[0]))===JSON.stringify(x[1])),
      nums:z.toNumbers('měitiān')==='mei3tian1',pair:z.lastUnit('a\u{20000}','zh')===2}});
  ok('window.zhUI exposes the pinyin helpers',U&&U.api==='audioPrime,badges,can3d,cardDrag,dayKey,lastUnit,normPinyin,play,pref,setPref,setSound,soundOn,stamp,summary,swipe,swish,syllables,toNumbers,track,voiceStatus',U&&U.api);
  ok('normPinyin treats nǐhǎo = ni3hao3 = Ni3 Hao3, lv4 = lǜ, ma = ma5',U&&U.same.every(Boolean),U&&JSON.stringify(U.same));
  ok('normPinyin keeps different tones apart',U&&U.different.every(Boolean));
  ok('syllables() splits marked and numbered pinyin',U&&U.syl.every(Boolean),U&&JSON.stringify(U.syl));
  ok('toNumbers and surrogate-pair length',U&&U.nums&&U.pair);
  if(!/cult/.test(f)){
    // writing canvas: undo ONE stroke vs clear all (normal-height viewport: no keyboard is open while drawing, and the
    // 340px canvas would sit under the sticky header in the short one, so strokes would never reach it)
    await p.setViewportSize({width:390,height:844});
    await p.tap('[data-act=qexit]').catch(()=>{});await p.tap('[data-tab=writing]');await p.waitForTimeout(200);
    const snap=()=>p.$eval('#cv',c=>c.toDataURL());
    const s0=await snap();
    await p.evaluate(()=>document.querySelector('#cv').scrollIntoView({block:'center'}));
    const b2=await p.$eval('#cv',c=>{const r=c.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}});
    const stroke=async(i)=>{await p.mouse.move(b2.x+30+i*40,b2.y+30);await p.mouse.down();await p.mouse.move(b2.x+60+i*40,b2.y+b2.h-40,{steps:4});await p.mouse.up()};
    await stroke(0);const s1=await snap();await stroke(1);const s2=await snap();await stroke(2);const s3=await snap();
    ok('three strokes change the canvas (precondition of the undo checks)',new Set([s0,s1,s2,s3]).size===4);
    await p.evaluate(()=>document.querySelector('[data-act=wundo]').click());
    ok('canvas: undo removes exactly the last stroke',await snap()===s2);
    await p.evaluate(()=>document.querySelector('[data-act=wundo]').click());
    ok('canvas: undo again goes back one more stroke',await snap()===s1);
    await p.evaluate(()=>document.querySelector('[data-act=wclear]').click());
    ok('canvas: clear-all removes every stroke',await snap()===s0);
    // order chips
    await p.tap('[data-tab=practice]');await p.tap('.act[data-k=order]');await p.waitForTimeout(200);
    const n=async()=>p.$$eval('#qbody .slot .chip',e=>e.length);
    for(let i=0;i<3;i++)await p.evaluate(()=>document.querySelector('#qbody .pool [data-act=pick]').click());
    ok('three chips placed',await n()===3);
    ok('remove-last / clear buttons enabled with chips placed',await p.$eval('[data-act=unpicklast]',e=>!e.disabled));
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
