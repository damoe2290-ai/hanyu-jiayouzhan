/* ---------- lesson-specific quiz kinds (extras: X.info labels, X.build cases) ---------- */
function dateStr(o){return numZh(o.m)+'月'+numZh(o.d)+'号，'+WD[o.w].zh}
function datePy(o){return numPy(o.m)+' yuè '+numPy(o.d)+' hào, '+WD[o.w].py.replace(/ /g,'')}
function qDate(){
  var cor={m:1+rnd(12),d:1+rnd(28),w:rnd(7)},opts=[cor],tries=0;
  while(opts.length<4&&tries++<80){
    var o={m:cor.m,d:cor.d,w:cor.w},k=rnd(3);
    if(k===0)o.w=(cor.w+1+rnd(6))%7;
    else if(k===1)o.d=1+((cor.d-1+1+rnd(27))%28);
    else o.m=1+((cor.m-1+1+rnd(11))%12);
    if(!opts.some(function(x){return dateStr(x)===dateStr(o)}))opts.push(o);
  }
  opts=shuffle(opts);
  return {type:'mc',wid:[],
    prompt:'<div class="calcard"><div class="cm">'+MON[cor.m-1]+'</div><div class="cd">'+cor.d+'</div><div class="cw">'+WD[cor.w].ar+'</div></div><div class="mut">كيف تقرأ هذا التاريخ بالصينية؟</div>',
    opts:opts.map(function(o){return {html:'<span class="han ltr" style="font-size:22px">'+dateStr(o)+'</span>',ok:o===cor}}),
    fb:'<div class="fw"><span class="han ltr" style="font-size:22px">'+dateStr(cor)+'</span>'+spkBtn(dateStr(cor),'sm')+'</div><div class="py mut ltr">'+datePy(cor)+'</div>'};
}
X.info={pic:['الصور','اختر الكلمة المناسبة للصورة'],date:['التاريخ','اقرأ التاريخ بالصينية']};
X.build=function(kind){
  switch(kind){
    case 'pic':return pick(PICQ,5).map(picW);
    case 'date':return [qDate(),qDate(),qDate(),qDate(),qDate()];
    case 'all':return [qMatch(6)].concat(pick(VOCAB,2).map(qListen),pick(PICQ,2).map(picW),pick(VOCAB,2).map(qTone),pick(SENT,2).map(qOrder),pick(FILL,2).map(qFill),[qDate(),qDate()]);
  }
  return null;
};
