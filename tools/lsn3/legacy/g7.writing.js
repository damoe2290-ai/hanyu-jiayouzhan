/* ---------- writing ---------- */
var W={i:0,strokes:[],cur:null,ghost:true};
function renderWriting(){
  var c=CHARS[W.i];
  var chips=CHARS.map(function(x,i){return '<button class="chip tgl'+(i===W.i?' on':'')+'" data-act="wch" data-i="'+i+'"><span class="han" style="font-size:24px;line-height:1.2">'+x.c+'</span></button>'}).join('');
  $('#p-writing').innerHTML=
    '<div class="sec-h"><h2>تدريب الكتابة</h2><p>اختر حرفاً، ثم اكتبه بإصبعك فوق النموذج الباهت.</p></div>'+
    '<div class="chips">'+chips+'</div>'+
    '<div class="winfo"><span class="big han">'+c.c+'</span><div><div class="py" style="font-size:20px">'+c.py+'</div><div>'+c.ar+'</div><div class="mut">عدد الخطوط: '+c.n+'</div></div>'+spkBtn(c.c)+'</div>'+
    '<div class="cvwrap"><canvas id="cv" width="640" height="640" aria-label="مساحة الكتابة"></canvas></div>'+
    '<div class="tools" style="margin-top:14px;justify-content:center"><button class="btn ghost sm" data-act="wundo">تراجع</button><button class="btn ghost sm" data-act="wclear">'+ic('redo',16)+' مسح الكل</button><button class="btn ghost sm" data-act="wghost">'+(W.ghost?'إخفاء النموذج':'إظهار النموذج')+'</button></div>'+
    '<p class="mut" style="margin-top:12px;text-align:center">قاعدة عامة في ترتيب الخطوط: من الأعلى إلى الأسفل، ومن اليسار إلى اليمين.</p>'+writingExtra();
  var cv=$('#cv');
  cv.addEventListener('pointerdown',function(e){e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(x){}W.cur=[pt(e)];W.strokes.push(W.cur);drawCanvas()});
  cv.addEventListener('pointermove',function(e){if(!W.cur)return;W.cur.push(pt(e));drawCanvas()});
  var end=function(){W.cur=null};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  drawCanvas();
  if(document.fonts&&document.fonts.load){document.fonts.load('500 64px "Noto Serif SC"',c.c).then(drawCanvas,function(){})}
}
function pt(e){var cv=$('#cv'),r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height}}
function drawCanvas(){
  var cv=$('#cv');if(!cv)return;
  var ctx=cv.getContext('2d'),cs=getComputedStyle(document.documentElement),w=cv.width,h=cv.height;
  var col=function(n){return cs.getPropertyValue(n).trim()};
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle=col('--surface');ctx.fillRect(0,0,w,h);
  ctx.strokeStyle=col('--line');ctx.lineWidth=3;ctx.setLineDash([14,12]);
  ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.moveTo(0,0);ctx.lineTo(w,h);ctx.moveTo(w,0);ctx.lineTo(0,h);ctx.stroke();
  ctx.setLineDash([]);
  if(W.ghost){
    ctx.globalAlpha=0.16;ctx.fillStyle=col('--fg');
    ctx.font='500 '+Math.round(w*0.76)+'px "Noto Serif SC","Songti SC","STSong",serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(CHARS[W.i].c,w/2,h/2+h*0.03);
    ctx.globalAlpha=1;
  }
  ctx.strokeStyle=col('--fg');ctx.lineWidth=18;ctx.lineCap='round';ctx.lineJoin='round';
  W.strokes.forEach(function(s){
    ctx.beginPath();ctx.moveTo(s[0].x,s[0].y);
    if(s.length===1)ctx.lineTo(s[0].x+0.1,s[0].y+0.1);
    for(var i=1;i<s.length;i++)ctx.lineTo(s[i].x,s[i].y);
    ctx.stroke();
  });
}

function writingExtra(){
  function sd(p){return '<svg class="sdg" viewBox="0 0 40 40" aria-hidden="true" style="stroke:var(--fg);stroke-width:2.5;fill:none;stroke-linecap:round;stroke-linejoin:round">'+p+'</svg>'}
  var st=[
    {zh:'竖弯',py:'shù wān',ar:'عمودي ثم ينعطف إلى اليمين',ex:'四',d:'<path d="M12 8v20a4 4 0 0 0 4 4h14"/>'},
    {zh:'横折弯',py:'héng zhé wān',ar:'أفقي، ثم ينزل، ثم ينعطف إلى اليمين',ex:'没',d:'<path d="M8 10h18v16a4 4 0 0 0 4 4h4"/>'}
  ];
  var sr=st.map(function(s){return '<div class="m">'+sd(s.d)+'<div class="t"><span class="z" dir="ltr">'+s.zh+' <span class="mut py" style="font-size:14px">'+s.py+'</span></span><span>'+s.ar+'</span></div><span class="han" style="font-size:26px" dir="ltr">'+s.ex+'</span></div>'}).join('');
  return '<div class="card" style="margin-top:18px"><h3 style="font-size:16px;margin-bottom:6px">خطوط جديدة في هذا الدرس</h3><div class="qa" style="margin-top:0">'+sr+'</div></div>'+
    '<div class="card" style="margin-top:12px"><h3 style="font-size:16px;margin-bottom:6px">بنية الحرف: يسار–يمين</h3><div class="qa" style="margin-top:0">'+
    '<div class="m">'+sd('<rect x="6" y="6" width="28" height="28"/><path d="M20 6v28"/>')+'<div class="t"><span class="z" dir="ltr">左右结构</span><span>يسار ويمين</span></div><span class="han" style="font-size:26px" dir="ltr">银 饭</span></div>'+
    '<div class="m">'+sd('<rect x="6" y="6" width="28" height="28"/><path d="M15 6v28M25 6v28"/>')+'<div class="t"><span class="z" dir="ltr">左中右结构</span><span>يسار ووسط ويمين</span></div><span class="han" style="font-size:26px" dir="ltr">谢 谁</span></div>'+
    '</div></div>';
}
