/* ---------- lesson-specific quiz kinds (extras: X.info labels, X.build cases) ---------- */
function qWhere(){
  var f=MAPQ[rnd(MAPQ.length)];
  var wrong=shuffle(OPTS.filter(function(o){return o[0]!==f.a})).slice(0,3);
  var right=OPTS.filter(function(o){return o[0]===f.a})[0];
  var opts=shuffle([right].concat(wrong));
  return {type:'mc',wid:[],
    prompt:'<div style="width:100%;max-width:340px;margin:auto">'+mapSvg()+'</div><div class="han ltr" style="font-size:22px;margin-top:8px">'+f.q+'</div><div class="py mut ltr">'+f.py+'</div>',
    opts:opts.map(function(o){return {html:'<span class="han ltr" style="font-size:20px">'+o[0]+'</span> <span class="py ltr mut">'+o[1]+'</span>',ok:o[0]===f.a}}),
    fb:'<div class="fw"><span class="han ltr" style="font-size:22px">'+f.q.replace('在哪儿？','')+'在'+f.a+'。</span>'+spkBtn(f.q.replace('在哪儿？','')+'在'+f.a+'。','sm')+'</div><div class="py mut ltr">'+f.py.replace(' zài nǎr?','')+' zài '+right[1]+'.</div>'};
}
X.info={pic:['الصور','اختر الكلمة المناسبة للصورة'],where:['الأماكن','اقرأ الخريطة وأجب بالصينية']};
X.build=function(kind){
  switch(kind){
    case 'pic':return pick(PICQ,5).map(picW);
    case 'where':return [qWhere(),qWhere(),qWhere(),qWhere(),qWhere()];
    case 'all':return [qMatch(6)].concat(pick(VOCAB,2).map(qListen),pick(PICQ,2).map(picW),pick(VOCAB,2).map(qTone),pick(SENT,2).map(qOrder),pick(FILL,2).map(qFill),[qWhere(),qWhere()]);
  }
  return null;
};
