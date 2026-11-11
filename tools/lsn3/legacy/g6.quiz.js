/* ---------- lesson-specific quiz kinds (extras: X.info labels, X.build cases) ---------- */
X.info={pic:['الصور','اختر الكلمة المناسبة للصورة'],num:['الأرقام','اقرأ الأرقام بالصينية'],money:['النقود','اقرأ المبالغ بالصينية']};
X.build=function(kind){
  switch(kind){
    case 'pic':return pick(PICQ,5).map(picW);
    case 'num':return [qNum(),qNum(),qNum(),qNum(),qNum()];
    case 'money':return [qMoney(),qMoney(),qMoney(),qMoney(),qMoney()];
    case 'all':return [qMatch(6)].concat(pick(VOCAB,2).map(qListen),pick(PICQ,2).map(picW),pick(VOCAB,2).map(qTone),pick(SENT,2).map(qOrder),pick(FILL,2).map(qFill),[qNum(),qMoney()]);
  }
  return null;
};
