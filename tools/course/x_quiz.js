/* ---------- beginners course: extra activities (extras slot X_QUIZ of tpl.html): tone drawing, classroom commands (TPR), pinyin builder ----------
   Data in D.beg: tones (contours), tonedraw [{zh,py,tone}], tpr [{zh,py,ar,do}], builder [{zh,py,init,fin}]. */
var BEG=D.beg||{};
var TONENAME={1:'النغمة الأولى (مستوية عالية)',2:'النغمة الثانية (صاعدة)',3:'النغمة الثالثة (تنخفض ثم ترتفع)',4:'النغمة الرابعة (هابطة)'};
var TONEPTS={1:[[0,5],[1,5]],2:[[0,3],[1,5]],3:[[0,2],[.4,1],[1,4]],4:[[0,5],[1,1]]};
function toneSvg(n,w,h,cls){
  var pts=TONEPTS[n].map(function(p){return (8+p[0]*(w-16)).toFixed(1)+','+(h-8-(p[1]-1)/4*(h-16)).toFixed(1)}).join(' ');
  return '<svg class="contour '+(cls||'')+'" viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><polyline points="'+pts+'" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
/* classify a drawn line (points in canvas pixels, y downward): 1 level, 2 rising, 3 dipping, 4 falling; 0 = too short or unclear.
   Tolerances: a rise or fall needs 18% of the canvas height, a dip needs its start 10% and its end 18% above its lowest point. */
function classifyTone(pts,w,h){
  if(!pts||pts.length<4)return 0;
  var p=pts.map(function(q){return {x:q.x/w,y:1-q.y/h}}),n=p.length,len=0,i;
  for(i=1;i<n;i++)len+=Math.hypot(p[i].x-p[i-1].x,p[i].y-p[i-1].y);
  if(len<.25)return 0;
  var k=Math.max(1,Math.round(n*.15)),sy=0,ey=0,mn=2,mx=-1,imn=0;
  for(i=0;i<k;i++){sy+=p[i].y;ey+=p[n-1-i].y}
  sy/=k;ey/=k;
  for(i=0;i<n;i++){if(p[i].y<mn){mn=p[i].y;imn=i}if(p[i].y>mx)mx=p[i].y}
  var pos=imn/(n-1);
  if(sy-mn>.1&&ey-mn>.18&&pos>.12&&pos<.88)return 3;
  var d=ey-sy;
  if(Math.abs(d)<.18&&(mx-mn)<.3)return 1;
  if(d>=.18)return 2;
  if(d<=-.18)return 4;
  return 0;
}
window.__toneClass=classifyTone;
function pyS(py){return String(py).split(' ').map(function(x){return '<span class="t'+toneOf(x)+'">'+esc(x)+'</span>'}).join(' ')}
function qToneDraw(it){return {type:'tonedraw',wid:[],it:it}}
var BEGR={};   /* R (the renderers) is defined after this slot: x_events.js hooks these in */
BEGR.tonedraw=function(q,b){
  var it=q.it;q.pts=[];q.drawn=false;
  b.innerHTML='<div class="qprompt"><span class="mut">اسمع الصوت ثم ارسم خط نغمته بإصبعك (من اليسار إلى اليمين)</span>'+spkBtn(it.zh,'big')+'<div class="han ltr" lang="zh-CN" style="font-size:44px">'+esc(it.zh)+'</div></div>'+
    '<div class="cvwrap bg-td"><canvas id="tdc" width="640" height="440" aria-label="مساحة رسم النغمة" style="touch-action:none"></canvas></div>'+
    '<div class="tools" style="justify-content:center;margin:10px 0"><button class="btn ghost sm" data-act="tdclear">مسح</button><button class="btn primary" data-act="tdcheck">تحقّق</button></div>'+
    '<button class="btn ghost sm bg-alt" data-act="tdalt">لا أستطيع الرسم؟ اختر النغمة بدلاً من ذلك</button><div class="bg-opts" id="tdopts" hidden>'+[1,2,3,4].map(function(n){return '<button class="opt" data-act="tdopt" data-i="'+n+'">'+toneSvg(n,84,64,'c'+n)+'<span>'+TONENAME[n]+'</span></button>'}).join('')+'</div>';
  tdPaint(q);
  var cv=$('#tdc');
  function pos(e){var r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height}}
  cv.addEventListener('pointerdown',function(e){if(Q.fin)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(x){}q.down=true;q.pts=[pos(e)];q.drawn=true;tdPaint(q)});
  cv.addEventListener('pointermove',function(e){if(!q.down)return;q.pts.push(pos(e));tdPaint(q)});
  function up(){q.down=false}
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  setTimeout(function(){if(Q&&Q.list[Q.i]===q)speak(it.zh)},250);
};
function tdPaint(q,show){
  var cv=$('#tdc');if(!cv)return;var c=cv.getContext('2d'),w=cv.width,h=cv.height,css=getComputedStyle(document.documentElement);
  c.clearRect(0,0,w,h);
  c.strokeStyle=css.getPropertyValue('--line').trim()||'#ccc';c.lineWidth=2;c.setLineDash([8,8]);
  for(var i=0;i<5;i++){var y=16+i*(h-32)/4;c.beginPath();c.moveTo(10,y);c.lineTo(w-10,y);c.stroke()}
  c.setLineDash([]);
  if(show){c.strokeStyle='#2E7D4F';c.lineWidth=12;c.lineCap='round';c.lineJoin='round';c.beginPath();TONEPTS[show].forEach(function(p,j){var x=40+p[0]*(w-80),y=h-16-(p[1]-1)/4*(h-32);j?c.lineTo(x,y):c.moveTo(x,y)});c.stroke()}
  if(q.pts&&q.pts.length>1){c.strokeStyle=show?'#B8322A':(css.getPropertyValue('--fg').trim()||'#222');c.lineWidth=show?7:10;c.lineCap='round';c.lineJoin='round';c.beginPath();q.pts.forEach(function(p,j){j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y)});c.stroke()}
}
function tdFinish(q,ok,got){
  var it=q.it;tdPaint(q,it.tone);
  var msg=ok?'':'<div class="mut">'+(got?'رسمتَ: '+TONENAME[got]:'الخط قصير أو غير واضح')+' · الصحيح هو الخط الأخضر</div>';
  finishQ(ok,[],'<div class="fw"><span class="han ltr" style="font-size:24px">'+esc(it.zh)+'</span><span class="py ltr">'+pyhtml(it.py)+'</span><span>'+TONENAME[it.tone]+'</span>'+spkBtn(it.zh,'sm')+'</div>'+msg);
  var nb=$('#tdopts');if(nb)nb.hidden=true;
}
function tprList(){
  var l=shuffle(BEG.tpr.slice());while(l.length<5)l=l.concat(shuffle(BEG.tpr.slice()));
  return l.slice(0,5).map(function(c){return {type:'tpr',wid:[],c:c}});
}
BEGR.tpr=function(q,b){
  var c=q.c;q.left=10;Q.streak=Q.streak||0;
  b.innerHTML='<div class="qprompt bg-tpr"><span class="mut">نفّذ الأمر بجسمك ثم اضغط «نفّذت»</span><div class="bigzh han ltr" lang="zh-CN" dir="ltr">'+esc(c.zh)+'</div><div class="py ltr big">'+pyhtml(c.py)+'</div>'+spkBtn(c.zh,'big')+
    '<div class="mut bg-tpr-ar" id="tprAr" hidden>'+esc(c.ar)+' · '+esc(c.do)+'</div></div>'+
    '<div class="bg-tbar" aria-hidden="true"><i id="tprT" style="width:100%"></i></div><div class="bg-tcount"><span class="cnt" id="tprC">10</span><span class="bg-streak" title="تتابع الأوامر">🔥 <b id="tprS">'+Q.streak+'</b></span></div>'+
    '<button class="btn primary wide" data-act="tprdone">نفّذت</button><button class="btn ghost sm" data-act="tprhint" style="margin-top:8px">أظهر المعنى</button>';
  setTimeout(function(){if(Q&&Q.list[Q.i]===q)speak(c.zh)},250);
  clearInterval(q.timer);
  q.timer=setInterval(function(){
    if(!Q||Q.list[Q.i]!==q||Q.fin){clearInterval(q.timer);return}
    q.left--;var t=$('#tprT'),n=$('#tprC');if(t)t.style.width=(q.left*10)+'%';if(n)n.textContent=q.left;
    if(q.left<=0){clearInterval(q.timer);Q.streak=0;var s=$('#tprS');if(s)s.textContent='0';finishQ(false,[],'<div class="fw"><span class="han ltr" style="font-size:24px">'+esc(c.zh)+'</span><span>'+esc(c.ar)+'</span></div><div class="mut">انتهى الوقت. المطلوب: '+esc(c.do)+'</div>')}
  },1000);
};
var PBGROUPS=[['zh','ch','sh','r'],['b','p','m','f'],['d','t','n','l'],['g','k','h'],['j','q','x'],['z','c','s']];
var TONEV={'ā':['a','āáǎà'],'ē':['e','ēéěè'],'ī':['i','īíǐì'],'ō':['o','ōóǒò'],'ū':['u','ūúǔù'],'ǖ':['ü','ǖǘǚǜ'],'á':['a','āáǎà'],'é':['e','ēéěè'],'í':['i','īíǐì'],'ó':['o','ōóǒò'],'ú':['u','ūúǔù'],'ǎ':['a','āáǎà'],'ě':['e','ēéěè'],'ǐ':['i','īíǐì'],'ǒ':['o','ōóǒò'],'ǔ':['u','ūúǔù'],'à':['a','āáǎà'],'è':['e','ēéěè'],'ì':['i','īíǐì'],'ò':['o','ōóǒò'],'ù':['u','ūúǔù']};
function toneVariantsOf(fin){
  var out=[];for(var i=0;i<fin.length;i++){var m=TONEV[fin[i]];if(m){m[1].split('').forEach(function(ch){if(ch!==fin[i])out.push(fin.slice(0,i)+ch+fin.slice(i+1))});break}}
  return out;
}
function qPyBuild(it){
  var grp=PBGROUPS.filter(function(g){return g.indexOf(it.init)>-1})[0]||[],others=shuffle(grp.filter(function(x){return x!==it.init}));
  var allInit=['b','p','m','f','d','t','n','l','g','k','h','zh','ch','sh','r'];
  others=others.concat(shuffle(allInit.filter(function(x){return x!==it.init&&others.indexOf(x)<0})));
  var finPool=shuffle((BEG.builder||[]).map(function(x){return x.fin}).filter(function(f,i,a){return f!==it.fin&&a.indexOf(f)===i}));
  var tv=shuffle(toneVariantsOf(it.fin));
  var fins=[it.fin].concat(tv.slice(0,1),finPool).filter(function(f,i,a){return a.indexOf(f)===i}).slice(0,4);
  return {type:'pybuild',wid:[],it:it,inits:shuffle([it.init].concat(others.slice(0,3))),fins:shuffle(fins),si:null,sf:null};
}
function pbHtml(q){
  var b=(q.si||'▢')+' + '+(q.sf||'▢');
  return '<div class="qprompt"><span class="mut">ركّب نطق هذا الحرف: الحرف الأول + الحرف الأخير</span>'+spkBtn(q.it.zh,'big')+'<div class="han ltr" lang="zh-CN" style="font-size:52px">'+esc(q.it.zh)+'</div></div>'+
    '<div class="bg-built ltr" dir="ltr" id="pbb"><span class="'+(q.si?'on':'')+'">'+esc(q.si||'▢')+'</span><b>+</b><span class="'+(q.sf?'on':'')+'">'+esc(q.sf||'▢')+'</span><b>=</b><span class="big py">'+(q.si&&q.sf?pyhtml(q.si+q.sf):'?')+'</span></div>'+
    '<div class="pool bg-pool" dir="ltr"><span class="mut">الحرف الأول</span>'+q.inits.map(function(x){return '<button class="chip'+(q.si===x?' pick':'')+'" data-act="pbinit" data-v="'+esc(x)+'"><span class="py">'+esc(x)+'</span></button>'}).join('')+'</div>'+
    '<div class="pool bg-pool" dir="ltr"><span class="mut">الحرف الأخير</span>'+q.fins.map(function(x){return '<button class="chip'+(q.sf===x?' pick':'')+'" data-act="pbfin" data-v="'+esc(x)+'"><span class="py">'+esc(x)+'</span></button>'}).join('')+'</div>'+
    '<div class="tools" style="justify-content:center;margin:8px 0"><button class="btn ghost sm" data-act="pbclear">مسح</button></div><button class="btn primary wide" data-act="pbcheck"'+(q.si&&q.sf?'':' disabled')+'>تحقّق</button>';
}
BEGR.pybuild=function(q,b){b.innerHTML=pbHtml(q);setTimeout(function(){if(Q&&Q.list[Q.i]===q)speak(q.it.zh)},250)};
X.info={tonedraw:['ارسم النغمة','اسمع الصوت وارسم خط النغمة'],tpr:['أوامر الفصل','نفّذ الأمر ثم اضغط «نفّذت»'],pybuild:['ركّب النطق','ركّب الحرف الأول والأخير']};
X.build=function(kind){
  switch(kind){
    case 'tonedraw':return pick(BEG.tonedraw,Math.min(4,BEG.tonedraw.length)).map(qToneDraw);
    case 'tpr':return tprList();
    case 'pybuild':return pick(BEG.builder,Math.min(5,BEG.builder.length)).map(qPyBuild);
  }
};
