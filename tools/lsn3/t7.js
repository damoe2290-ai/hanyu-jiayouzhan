/* Levels challenge test.   PAGE=lesson-10.html PAGE_PREFIX= node tools/lsn3/t7.js     (run from the repo root; PAGE defaults to lesson-9.html)
   Plays complete sessions with an oracle that reads each question's answer from the page, and checks: gating of levels,
   the 75% pass rate as a progress marker only (never a lock; the Hard level opens first on a fresh lesson), retry, typed answers (ni3 = nǐ, spaces/punctuation ignored, wrong tone = close, pinyin typed
   instead of characters = close), hints and their point penalty, repeat of missed questions, persistence, fallback
   without zh-ui.js, lessons without levels, and the layout on a short phone viewport (touch). */
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright']){try{({chromium}=require(m));break}catch(e){}}
const fs=require('fs');const PAGE=process.env.PAGE||'lesson-9.html';
const KEY='noor-'+(PAGE.match(/^lesson-(\d+)/)?'gram'+RegExp.$1:PAGE.replace(/^(prac|lis|biz)-(\d+)\.html$/,'$1$2'))+'-v1';const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const PFX=process.env.PAGE_PREFIX===undefined?'w-':process.env.PAGE_PREFIX;
const URL=n=>'file://'+process.cwd()+'/'+PFX+n;
let fails=0;const ok=(name,cond,extra)=>{console.log((cond?'ok   ':'FAIL ')+name+(extra!==undefined&&extra!==''?'  '+extra:''));if(!cond)fails++};
const info=p=>p.evaluate(()=>{const Q=window.__q();if(!Q)return null;const q=Q.list[Q.i];
  return {i:Q.i,n:Q.list.length,lv:Q.lv,gain:Q.gain,score:Q.score,type:q.type,mode:q.mode||null,okIdx:q.opts?q.opts.map(o=>o.ok).indexOf(true):-1,
    tok:q.s?q.s.tokens.length:0,ans:q.f?q.f.ans:(q.ans||null),words:q.words?q.words.length:0,py:q.py||''}});
async function answer(p,q,right,typed){
  if(q.type==='mc'){const idx=right?q.okIdx:(q.okIdx===0?1:0);await p.click('#qbody .opt:nth-child('+(idx+1)+')')}
  else if(q.type==='order'){const seq=[...Array(q.tok).keys()];if(!right)seq.reverse();for(const k of seq)await p.click('#qbody .pool [data-act=pick][data-i="'+k+'"]');await p.click('[data-act=checkorder]')}
  else if(q.type==='fill'){if(right)await p.click('#qbody .pool [data-o="'+q.ans+'"]');else await p.evaluate(a=>{[...document.querySelectorAll('#qbody .pool .chip')].find(c=>c.dataset.o!==a).click()},q.ans)}
  else if(q.type==='match'){for(let i=0;i<q.words;i++){await p.click('#qbody [data-act=ml][data-i="'+i+'"]');await p.click('#qbody [data-act=mr][data-i="'+i+'"]')}}
  else if(q.type==='type'){await p.fill('[data-tin]',typed===undefined?q.ans:typed);await p.click('[data-act=tcheck]')}
}
const fbClass=p=>p.$eval('#qfb .fb',e=>e.className.replace('fb','').trim());
async function playLevel(p,rightFn){
  for(;;){const q=await info(p);if(!q)break;await answer(p,q,rightFn(q.i,q));await p.click('#qnext');await p.waitForTimeout(30)}
  await p.waitForSelector('.res');return p.$eval('.res',e=>e.innerText.replace(/\s+/g,' '));
}
const state=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),KEY);
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));
let ctx=await b.newContext({viewport:{width:390,height:844}});let p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|net::|Failed to load|ERR_/.test(m.text()))errs.push(m.text())});
await p.goto(URL(PAGE));await p.waitForTimeout(500);await p.click('[data-tab=practice]');

console.log('--- levels hub and gating');
ok('levels card is on the practice tab',(await p.$$('.lvfeat')).length===1);
await p.click('[data-act=lvhub]');
ok('all three levels are open on a fresh lesson: no lock class, no disabled start button, no "locked" wording',await p.$$eval('.lvc',e=>e.length===3&&e.every(x=>!x.classList.contains('lock')&&!x.querySelector('[data-act=lvstart]').disabled&&x.innerText.indexOf('مقفل')<0)));
ok('level 1 is the recommended next one (highlight); 2 and 3 are open but not highlighted',JSON.stringify(await p.$$eval('.lvc',e=>e.map(x=>x.classList.contains('rec'))))==='[true,false,false]');
console.log('--- the Hard level can be opened first (nothing gates it)');
await p.click('[data-act=lvstart][data-n="3"]');await p.waitForTimeout(150);
const first=await info(p);
ok('Hard level opens on a fresh lesson: a typed question comes first and the level bar shows level 3',!!first&&first.type==='type'&&first.mode==='py'&&first.lv===3&&await p.$eval('#lvbar .cur',e=>e.textContent.indexOf('3')>=0),JSON.stringify(first&&[first.type,first.mode,first.lv]));
await p.click('[data-act=qexit]');await p.click('[data-act=lvhub]');

console.log('--- level 1 (easy): multiple choice, matching, true/false');
await p.click('[data-act=lvstart][data-n="1"]');await p.waitForTimeout(100);
let types=await p.evaluate(()=>window.__q().list.map(q=>q.type));
ok('level 1 has 8 questions: 1 matching + 7 multiple-choice / true-false',types.length===8&&types.filter(t=>t==='match').length===1&&types.filter(t=>t==='mc').length===7,types.join(','));
ok('level bar shows level 1 as current',await p.$eval('#lvbar .cur',e=>e.textContent.indexOf('1')>=0));
let res=await playLevel(p,()=>true);
ok('all correct passes level 1 (8 / 8)',res.indexOf('اجتزتَ المستوى 1')>=0&&res.indexOf('8 / 8')>=0,res.slice(0,70));
ok('"next level" is offered',!!(await p.$('[data-act=lvnext]')));
let S=await state(p);ok('pass is saved in the lesson state (existing key (key from PAGE))',!!(S.lv&&S.lv.passed&&S.lv.passed['1']===true));

console.log('--- the pass rate marks progress and recommends the next level');
await p.click('[data-act=lvhub]');
const tags=await p.$$eval('.lvc',e=>e.map(x=>({badge:/اجتزته/.test(x.querySelector('.tag')?x.querySelector('.tag').textContent:''),rec:x.classList.contains('rec'),lock:x.classList.contains('lock')||x.querySelector('[data-act=lvstart]').disabled})));
ok('after passing level 1: it shows the "passed" badge, level 2 is the recommended next, nothing is locked',tags[0].badge&&!tags[0].rec&&!tags[1].badge&&tags[1].rec&&!tags[2].rec&&tags.every(t=>!t.lock),JSON.stringify(tags));
console.log('--- level 2 (medium): below 75% fails, retry');
await p.click('[data-act=lvstart][data-n="2"]');await p.waitForTimeout(100);
types=await p.evaluate(()=>window.__q().list.map(q=>q.type));
ok('level 2 = 3 order + 3 fill + 2 listening',types.length===8&&types.filter(t=>t==='order').length===3&&types.filter(t=>t==='fill').length===3&&types.filter(t=>t==='mc').length===2,types.join(','));
res=await playLevel(p,i=>i>=3);
ok('5 / 8 is below the 75% pass rate: not passed',res.indexOf('لم تصل إلى 6 من 8')>=0&&res.indexOf('5 / 8')>=0,res.slice(0,90));
ok('retry is offered (red) and the next level is still offered (not red): a failed level never blocks',await p.evaluate(()=>{const r=document.querySelector('[data-act=lvretry]'),n=document.querySelector('[data-act=lvnext]');return !!r&&!!n&&r.classList.contains('primary')&&!n.classList.contains('primary')&&!n.disabled}));
S=await state(p);ok('failed level is not saved as passed',!S.lv.passed['2']);
await p.click('[data-act=lvhub]');
ok('after the failed level 2: level 3 is open, level 2 is still the recommended next',JSON.stringify(await p.$$eval('.lvc',e=>e.map(x=>({lock:x.classList.contains('lock')||x.querySelector('[data-act=lvstart]').disabled,rec:x.classList.contains('rec')}))))==='[{"lock":false,"rec":false},{"lock":false,"rec":true},{"lock":false,"rec":false}]');
await p.click('[data-act=lvstart][data-n="2"]');await p.waitForTimeout(100);
res=await playLevel(p,()=>true);ok('retry with all correct passes level 2',res.indexOf('اجتزتَ المستوى 2')>=0&&res.indexOf('8 / 8')>=0);

console.log('--- level 3 (hard): typed answers');
await p.click('[data-act=lvnext]');await p.waitForTimeout(100);
const modes=await p.evaluate(()=>window.__q().list.map(q=>q.mode));
ok('level 3 = 2 pinyin + 2 characters + 2 typed cloze + 2 sentences',JSON.stringify(modes)==='["py","py","zh","zh","cloze","cloze","sent","sent"]',JSON.stringify(modes));
async function typedStep(label,typedFn,expectCls,expectGain,pre){
  const q=await info(p);if(pre)await pre(q);
  const typed=await typedFn(q);await answer(p,q,true,typed);
  const cls=await fbClass(p);const after=await info(p);
  ok(label,cls===expectCls&&after.gain===expectGain,'['+typed+'] -> '+cls+', points so far '+after.gain);
  await p.click('#qnext');await p.waitForTimeout(30);
}
await typedStep('pinyin with tone marks + hint = correct, but only 5 points (hint penalty)',q=>q.ans,'good',5,async()=>{
  await p.click('[data-act=thint]');const h=await p.$eval('#thint',e=>e.textContent);
  ok('hint shows the beginning of the answer',h.indexOf('تلميح')>=0&&h.length>8,h.trim());
  ok('hint button is disabled after use',await p.$eval('[data-act=thint]',e=>e.disabled))});
await typedStep('numbered pinyin without spaces (ni3hao3 style) is accepted',q=>p.evaluate(a=>window.zhUI.toNumbers(a).replace(/\s+/g,''),q.ans),'good',15);
await typedStep('pinyin typed instead of characters = "close", half points',q=>q.py,'close',20);
await typedStep('characters with spaces and punctuation are accepted',q=>' '+q.ans.split('').join(' ')+'。','good',30);
await typedStep('wrong typed cloze answer = wrong, no points, answer shown',()=>'天天','bad',30);
await typedStep('correct typed cloze answer',q=>q.ans,'good',40);
await typedStep('almost-right sentence (one extra character) = "close"',q=>q.ans+'呢','close',45);
await typedStep('sentence with spaces and different punctuation is accepted',q=>q.ans.replace(/./g,'$& ')+'！','good',55);
res=await p.waitForSelector('.res').then(()=>p.$eval('.res',e=>e.innerText.replace(/\s+/g,' ')));
ok('6 / 8 (close counts half) passes the hard level at 75%',res.indexOf('أتممتَ التحدي كله')>=0&&res.indexOf('6 / 8')>=0,res.slice(0,80));
ok('review of missed questions is offered with the right count (3)',res.indexOf('راجع أخطاءك (3)')>=0);

console.log('--- missed questions repeat at the end');
await p.click('[data-act=lvreview]');await p.waitForTimeout(100);
const rinfo=await info(p);
ok('review round has the 3 missed questions',rinfo.n===3&&rinfo.lv==='r',JSON.stringify([rinfo.n,rinfo.lv]));
ok('level bar says it is the review round',await p.$eval('#lvbar',e=>e.textContent.indexOf('مراجعة الأخطاء')>=0));
res=await playLevel(p,()=>true);
ok('review round finishes (3 / 3 with the right answers)',res.indexOf('انتهت جولة المراجعة')>=0&&res.indexOf('3 / 3')>=0,res.slice(0,60));

console.log('--- persistence');
await p.reload();await p.waitForTimeout(400);await p.click('[data-tab=practice]');
ok('card shows stars after reload (3 levels passed)',(await p.$$eval('.lvfeat .stars .on',e=>e.length))===3);
await p.click('[data-act=lvhub]');
ok('all three levels show the passed badge after reload (and none is recommended or locked)',(await p.$$eval('.lvc .tag',e=>e.map(x=>x.textContent.trim()))).join()==='اجتزته,اجتزته,اجتزته'&&(await p.$$eval('.lvc',e=>e.every(x=>!x.classList.contains('rec')&&!x.classList.contains('lock')))));
S=await state(p);
const keys=await p.evaluate(()=>Object.keys(localStorage));
ok('level progress lives inside the existing state key (no new storage key was added)',!!S.lv&&keys.every(k=>k===KEY||k===KEY.replace(/-v1$/,'-theme')||k.indexOf('-theme')>0||k.indexOf('zh-')===0),keys.join(','));
ok('no page errors in the whole session',errs.length===0,errs.join(' | '));
await ctx.close();

console.log('--- fallback: shared files blocked');
ctx=await b.newContext({viewport:{width:390,height:844}});p=await ctx.newPage();const e2=[];p.on('pageerror',e=>e2.push(e.message));
await p.route(/zh-ui\.(css|js)$/,r=>r.abort());await p.goto(URL(PAGE));await p.waitForTimeout(400);await p.click('[data-tab=practice]');
ok('without zh-ui.js there is no levels card (nothing half-working)',(await p.$$('.lvfeat')).length===0);
await p.click('.act[data-k=meaning]');ok('the other activities still work',!!(await info(p)));ok('no page errors',e2.length===0,e2.join(' | '));
await ctx.close();

console.log('--- lessons without levels');
for(const f of ['lesson-6.html','lesson-7.html','lesson-8.html','prac-6.html','prac-7.html','prac-8.html','prac-9.html','prac-10.html','lis-6.html','lis-9.html','biz-4.html','biz-6.html'].filter(f=>f!==PAGE&&!/"lv":\{/.test(fs.readFileSync(f,'utf8')))){
  ctx=await b.newContext({viewport:{width:390,height:844}});p=await ctx.newPage();await p.goto(URL(f));await p.waitForTimeout(300);await p.click('[data-tab=practice]');
  ok(f+': no levels card (lesson has not opted in yet)',(await p.$$('.lvfeat')).length===0);await ctx.close();
}

console.log('--- phone layout (390x340 touch, keyboard-height viewport): typed question');
ctx=await b.newContext({viewport:{width:390,height:340},hasTouch:true,isMobile:true});
await ctx.addInitScript(k=>{if(!localStorage.getItem(k))localStorage.setItem(k,JSON.stringify({lv:{passed:{1:true,2:true},best:{}}}))},KEY);
p=await ctx.newPage();const e3=[];p.on('pageerror',e=>e3.push(e.message));
await p.goto(URL(PAGE));await p.waitForTimeout(400);await p.tap('[data-tab=practice]');await p.tap('[data-act=lvhub]');
ok('an earlier session\'s progress only marks levels: all open, level 3 is the recommended next',JSON.stringify(await p.$$eval('.lvc',e=>e.map(x=>({lock:x.classList.contains('lock')||x.querySelector('[data-act=lvstart]').disabled,rec:x.classList.contains('rec')}))))==='[{"lock":false,"rec":false},{"lock":false,"rec":false},{"lock":false,"rec":true}]');
await p.tap('[data-act=lvstart][data-n="3"]');await p.waitForTimeout(300);
ok('the answer field takes focus (the phone keyboard opens)',await p.evaluate(()=>document.activeElement&&document.activeElement.hasAttribute('data-tin')));
const lay=await p.evaluate(()=>{const f=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom),h:Math.round(r.height)}};return {input:f('[data-tin]'),hint:f('[data-act=thint]'),check:f('[data-act=tcheck]'),vh:innerHeight}});
ok('answer field, hint and check buttons are all on screen and at least 44px tall',lay.input.h>=44&&lay.hint.h>=44&&lay.check.h>=44&&lay.check.bottom<=lay.vh&&lay.input.top>=0,JSON.stringify(lay));
await p.tap('[data-act=tcheck]');ok('checking an empty answer asks for an answer (no wrong mark)',(await p.$$('#qfb .fb')).length===0&&await p.$eval('#toast',e=>!e.hidden));
ok('no page errors',e3.length===0,e3.join(' | '));
await ctx.close();

await b.close();console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0)})();
