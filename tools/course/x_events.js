R.tonedraw=BEGR.tonedraw;R.tpr=BEGR.tpr;R.pybuild=BEGR.pybuild;
/* ---------- beginners course: events of the extra activities (extras slot X_EVENTS of tpl.html) ---------- */
A.tdclear=function(){var q=Q.list[Q.i];if(Q.fin)return;q.pts=[];tdPaint(q)};
A.tdcheck=function(){
  var q=Q.list[Q.i];if(Q.fin)return;var cv=$('#tdc');
  var got=classifyTone(q.pts,cv.width,cv.height);
  tdFinish(q,got===q.it.tone,got);
};
A.tdalt=function(){var o=$('#tdopts');if(o)o.hidden=!o.hidden};
A.tdopt=function(t){var q=Q.list[Q.i];if(Q.fin)return;var n=+t.dataset.i;tdFinish(q,n===q.it.tone,n)};
A.tprdone=function(){var q=Q.list[Q.i];if(Q.fin)return;clearInterval(q.timer);Q.streak=(Q.streak||0)+1;var s=$('#tprS');if(s)s.textContent=Q.streak;
  finishQ(true,[],'<div class="fw"><span class="han ltr" style="font-size:24px">'+esc(q.c.zh)+'</span><span>'+esc(q.c.ar)+'</span></div><div class="mut">🔥 '+Q.streak+'</div>')};
A.tprhint=function(){var a=$('#tprAr');if(a)a.hidden=false};
A.pbinit=function(t){var q=Q.list[Q.i];if(Q.fin)return;q.si=t.dataset.v;$('#qbody').innerHTML=pbHtml(q)};
A.pbfin=function(t){var q=Q.list[Q.i];if(Q.fin)return;q.sf=t.dataset.v;$('#qbody').innerHTML=pbHtml(q)};
A.pbclear=function(){var q=Q.list[Q.i];if(Q.fin)return;q.si=q.sf=null;$('#qbody').innerHTML=pbHtml(q)};
A.pbcheck=function(){
  var q=Q.list[Q.i];if(Q.fin||!q.si||!q.sf)return;var ok=q.si===q.it.init&&q.sf===q.it.fin;
  finishQ(ok,[],'<div class="fw"><span class="han ltr" style="font-size:24px">'+esc(q.it.zh)+'</span><span class="py ltr">'+pyhtml(q.it.py)+'</span>'+spkBtn(q.it.zh,'sm')+'</div><div class="py ltr mut">'+esc(q.it.init)+' + '+esc(q.it.fin)+' = '+esc(q.it.py)+'</div>');
  if(ok)speak(q.it.zh);
};
