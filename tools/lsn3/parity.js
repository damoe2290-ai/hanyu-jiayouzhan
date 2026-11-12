/* Old-vs-new comparison for the migrated hand-built lessons 6-8, tab by tab.
   node parity.js <dir-with-OLD-lesson-N.html> <dir-with-NEW-lesson-N.html> [6 7 8]
   Old pages: git show 501fc2e:lesson-N.html. Both are opened with the same seeded Math.random, a clean storage and the
   same sequence of clicks; the generator is re-seeded right before each quiz starts; the visible text of every tab panel, of every grammar widget state, of the first question
   of every quiz kind, and of the word sheet is compared. Known intended differences (listed in the output) are the
   hub-review hook and the template's extra header/links, which live outside the panels. */
let chromium;for(const m of ['/opt/npm-tools/node_modules/playwright-core','playwright-core','playwright']){try{({chromium}=require(m));break}catch(e){}}
const fs=require('fs');const EXE=process.env.CHROME||['/usr/bin/google-chrome','/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const [OLD,NEW,...rest]=process.argv.slice(2);const LESSONS=rest.length?rest:['6','7','8'];
const SEED="(function(){var s=12345;Math.random=function(){s=(s*1664525+1013904223)%4294967296;return s/4294967296};Math.__reseed=function(){s=12345}})();";
const norm=t=>t.replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n').trim();
/* Phase 6a: both pages are opened with reduced motion (so the flashcard flips at once, as before the 3D flip), and the 'تركيز' focus switch of the dialogue tab and the
   'عرفتها' legend above the word list are hidden before comparing (new, intended). Everything else is still compared.
   Intended additions since the migration (levels card, see panel() below; typing tools): the writing canvas and the sentence-order questions got an undo button and
   'clear all' (the old canvas button was just 'مسح'). Ignore exactly those labels, nothing else. */
const TOOLS=l=>{l=l.trim();return l==='تراجع'||l==='مسح الكل'};
const normW=t=>norm(t).split('\n').filter(l=>!TOOLS(l)&&true).map(l=>l).join('\n').replace(/(^|\n)مسح(?=\n|$)/g,'');

async function open(b,dir,n){const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|net::|Failed to load|ERR_/.test(m.text()))errs.push(m.text())});
  await p.addInitScript(SEED);await p.goto('file://'+dir+'/lesson-'+n+'.html');await p.waitForTimeout(500);return {ctx,p,errs}}
/* Intended addition since the migration: the levels-challenge card on the practice tab (data-act=lvhub). It is hidden before the text is read, so exactly that card is ignored and nothing else. */
const panel=(p,t)=>p.$eval('#p-'+t,e=>{e.querySelectorAll('[data-act=lvhub],[data-act=focus],.kleg').forEach(x=>x.style.display='none');return e.innerText}).then(norm).catch(()=>'<missing>');
function firstDiff(a,b){const x=a.split('\n'),y=b.split('\n');for(let i=0;i<Math.max(x.length,y.length);i++)if(x[i]!==y[i])return 'line '+i+': OLD «'+(x[i]||'')+'» / NEW «'+(y[i]||'')+'»';return ''}
(async()=>{const b=await chromium.launch(Object.assign({args:['--no-sandbox']},EXE?{executablePath:EXE}:{}));let bad=0,total=0;
const res=[];
for(const n of LESSONS){const o=await open(b,OLD,n),w=await open(b,NEW,n);
  /* Intended difference (Lesson 7): the picture quiz pool (PICQ) grew from 18 to 29 words (the 11 position words got drawings),
     so with the fixed random seed the first question of the 'pic' and 'all' quizzes is another word. Only these two checks, only in lesson 7. */
  const intended=name=>n==='7'&&/^quiz (pic|all) first question$/.test(name);
  const check=(name,a,c)=>{total++;if(a===c){res.push(['ok',n,name]);return}if(intended(name)){res.push(['ok',n,name+' (intended: larger picture pool)']);return}bad++;res.push(['DIFF',n,name,firstDiff(a,c)])};
  const tabs=['vocab','dialogue','grammar','writing','practice'];
  for(const t of tabs){await o.p.click('[data-tab='+t+']');await w.p.click('[data-tab='+t+']');await o.p.waitForTimeout(120);await w.p.waitForTimeout(120);check('tab '+t,t==='writing'?normW(await panel(o.p,t)):await panel(o.p,t),t==='writing'?normW(await panel(w.p,t)):await panel(w.p,t))}
  // vocabulary card interactions
  await o.p.click('[data-tab=vocab]');await w.p.click('[data-tab=vocab]');
  for(const act of ['#fc','[data-act=know]','[data-act=again]','[data-act=next]','[data-act=prev]']){await o.p.click(act);await w.p.click(act);check('vocab '+act,await panel(o.p,'vocab'),await panel(w.p,'vocab'))}
  // word sheet in dialogue and grammar
  await o.p.click('[data-tab=dialogue]');await w.p.click('[data-tab=dialogue]');
  await o.p.click('#p-dialogue .tok');await w.p.click('#p-dialogue .tok');
  check('dialogue word sheet',norm(await o.p.$eval('#sheet',e=>e.innerText)),norm(await w.p.$eval('#sheet',e=>e.innerText)));
  await o.p.click('#sheet [data-act=closesheet]').catch(()=>{});await w.p.click('#sheet [data-act=closesheet]').catch(()=>{});
  // every interactive grammar widget, in order
  await o.p.click('[data-tab=grammar]');await w.p.click('[data-tab=grammar]');
  const cnt=await o.p.$$eval('#p-grammar [data-act]',e=>e.length);const cntN=await w.p.$$eval('#p-grammar [data-act]',e=>e.length);
  check('grammar widget count',String(cnt),String(cntN));
  for(let i=0;i<Math.min(cnt,cntN);i++){
    const ao=await o.p.$$('#p-grammar [data-act]'),aw=await w.p.$$('#p-grammar [data-act]');
    if(!ao[i]||!aw[i])break;const act=await ao[i].getAttribute('data-act');
    await ao[i].click({force:true});await aw[i].click({force:true});await o.p.waitForTimeout(40);await w.p.waitForTimeout(40);
    check('grammar #'+i+' ['+act+']',await panel(o.p,'grammar'),await panel(w.p,'grammar'));
    await o.p.click('#sheet [data-act=closesheet]',{timeout:300}).catch(()=>{});await w.p.click('#sheet [data-act=closesheet]',{timeout:300}).catch(()=>{});
  }
  // writing: pick every character button
  await o.p.click('[data-tab=writing]');await w.p.click('[data-tab=writing]');
  const wch=await o.p.$$eval('#p-writing [data-act=wch]',e=>e.length);check('writing char buttons',String(wch),String(await w.p.$$eval('#p-writing [data-act=wch]',e=>e.length)));
  for(let i=0;i<wch;i++){const a=await o.p.$$('#p-writing [data-act=wch]'),c=await w.p.$$('#p-writing [data-act=wch]');await a[i].click();await c[i].click();check('writing char #'+i,normW(await panel(o.p,'writing')),normW(await panel(w.p,'writing')))}
  // quiz kinds: first question of each
  await o.p.click('[data-tab=practice]');await w.p.click('[data-tab=practice]');
  const kinds=await o.p.$$eval('#p-practice .act[data-k]',e=>e.map(x=>x.dataset.k));const kindsN=await w.p.$$eval('#p-practice .act[data-k]',e=>e.map(x=>x.dataset.k));
  check('quiz kinds',kinds.join(','),kindsN.join(','));
  for(const k of kinds){if(!kindsN.includes(k))continue;
    await o.p.evaluate(()=>Math.__reseed());await w.p.evaluate(()=>Math.__reseed());  /* same random sequence for both builders */
    await o.p.click('#p-practice .act[data-k='+k+']');await w.p.click('#p-practice .act[data-k='+k+']');await o.p.waitForTimeout(80);await w.p.waitForTimeout(80);
    check('quiz '+k+' first question',normW(await o.p.$eval('#qbody',e=>e.innerText)),normW(await w.p.$eval('#qbody',e=>e.innerText)));
    await o.p.click('[data-act=qexit]');await w.p.click('[data-act=qexit]');}
  check('page errors','[]',JSON.stringify(w.errs)==='[]'?'[]':JSON.stringify(w.errs));
  if(o.errs.length)res.push(['info',n,'OLD page errors',JSON.stringify(o.errs)]);
  await o.ctx.close();await w.ctx.close();
}
for(const r of res){if(r[0]!=='ok')console.log(r.join(' | '))}
const byLesson={};res.forEach(r=>{if(r[0]==='ok'||r[0]==='DIFF'){byLesson[r[1]]=byLesson[r[1]]||{ok:0,diff:0};byLesson[r[1]][r[0]==='ok'?'ok':'diff']++}});
console.log(JSON.stringify(byLesson),'checks',total,'differences',bad);
await b.close();process.exit(bad?1:0)})();
