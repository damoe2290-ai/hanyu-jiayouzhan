/* ---------- grammar ---------- */
var G={s:0,a:0,p:0,num:0,rmb:0,it:0,pat:0,mw:0};
var SUBJ=[
 {zh:'我',py:'wǒ',ar:'أنا',v:'أريد',nv:'لا أريد'},{zh:'马丁',py:'Mǎ dīng',ar:'مارتن',v:'يريد',nv:'لا يريد'},{zh:'你',py:'nǐ',ar:'أنتَ',v:'تريد',nv:'لا تريد'}
];
var ADV=[{zh:'',py:'',ar:'بدون'},{zh:'也',py:'yě',ar:'أيضاً'},{zh:'不',py:'bù',ar:'لا'}];
var PRED=[
 {zh:'学习汉语',py:'xué xí Hàn yǔ',ar:'دراسة الصينية'},{zh:'买苹果',py:'mǎi píng guǒ',ar:'شراء تفاح'},
 {zh:'认识她',py:'rèn shi tā',ar:'التعرّف عليها'},{zh:'买电脑',py:'mǎi diàn nǎo',ar:'شراء كمبيوتر'}
];
var NUMB=[
 {n:'101',zh:'一百零一',py:'yì bǎi líng yī'},{n:'110',zh:'一百一十',py:'yì bǎi yī shí'},{n:'202',zh:'二百零二',py:'èr bǎi líng èr'},
 {n:'309',zh:'三百零九',py:'sān bǎi líng jiǔ'},{n:'515',zh:'五百一十五',py:'wǔ bǎi yī shí wǔ'},{n:'818',zh:'八百一十八',py:'bā bǎi yī shí bā'},
 {n:'1001',zh:'一千零一',py:'yì qiān líng yī'},{n:'2015',zh:'二千零一十五',py:'èr qiān líng yī shí wǔ'},{n:'6220',zh:'六千二百二十',py:'liù qiān èr bǎi èr shí'},
 {n:'10000',zh:'一万',py:'yí wàn'},{n:'10001',zh:'一万零一',py:'yí wàn líng yī'},{n:'20300',zh:'二万零三百',py:'èr wàn líng sān bǎi'}
];
var RMB=[
 {n:'0.02',zh:'二分',py:'èr fēn'},{n:'0.20',zh:'两毛',py:'liǎng máo'},{n:'0.22',zh:'两毛二',py:'liǎng máo èr'},{n:'2.20',zh:'两块二',py:'liǎng kuài èr'},
 {n:'2.22',zh:'两块二毛二',py:'liǎng kuài èr máo èr'},{n:'5.02',zh:'五块零二分',py:'wǔ kuài líng èr fēn'},{n:'100.08',zh:'一百块零八分',py:'yì bǎi kuài líng bā fēn'},
 {n:'181.09',zh:'一百八十一块零九分',py:'yì bǎi bā shí yī kuài líng jiǔ fēn'},{n:'1000.20',zh:'一千块零二毛',py:'yì qiān kuài líng èr máo'}
];
var ITEMS=[
 {zh:'苹果',py:'píng guǒ',ar:'التفاح',pr:'三块五',pp:'sān kuài wǔ',pa:'٣٫٥ يوان'},{zh:'香蕉',py:'xiāng jiāo',ar:'الموز',pr:'一块八',pp:'yí kuài bā',pa:'١٫٨ يوان'},
 {zh:'西瓜',py:'xī guā',ar:'البطيخ',pr:'一块五',pp:'yí kuài wǔ',pa:'١٫٥ يوان'},{zh:'草莓',py:'cǎo méi',ar:'الفراولة',pr:'五块五',pp:'wǔ kuài wǔ',pa:'٥٫٥ يوان'},
 {zh:'橘子',py:'jú zi',ar:'اليوسفي',pr:'两块八',pp:'liǎng kuài bā',pa:'٢٫٨ يوان'}
];
var MW=[
 {zh:'斤',py:'jīn',yi:'yì',ar:'جين'},{zh:'台',py:'tái',yi:'yì',ar:'جهاز'},{zh:'种',py:'zhǒng',yi:'yì',ar:'نوع'},
 {zh:'个',py:'gè',yi:'yí',ar:'وحدة'},{zh:'部',py:'bù',yi:'yí',ar:'(قاموس/هاتف)'},{zh:'块',py:'kuài',yi:'yí',ar:'يوان'}
];
var SPELL=[
 {zh:'句',py:'jù',txt:'j + ü → ju',ar:'جملة'},{zh:'去',py:'qù',txt:'q + ü → qu',ar:'يذهب'},{zh:'学',py:'xué',txt:'x + üe → xue',ar:'يتعلّم'},
 {zh:'女',py:'nǚ',txt:'n + ü → nü',ar:'أنثى (تبقى ü)'},{zh:'绿',py:'lǜ',txt:'l + ü → lü',ar:'أخضر (تبقى ü)'}
];
var PAIRS=[
 [{zh:'记',py:'jì',ar:'يسجّل'},{zh:'志',py:'zhì',ar:'طموح'}],
 [{zh:'七',py:'qī',ar:'سبعة'},{zh:'吃',py:'chī',ar:'يأكل'}],
 [{zh:'西',py:'xī',ar:'غرب'},{zh:'诗',py:'shī',ar:'شعر'}],
 [{zh:'私',py:'sī',ar:'خاص'},{zh:'西',py:'xī',ar:'غرب'}]
];
function tok(zh,py){return '<span class="tok" style="cursor:default"><span class="py">'+pyhtml(py)+'</span><span class="zh">'+han(zh,py)+'</span></span>'}
function tile(w,txt){return '<div class="tile"><span class="han" style="font-size:24px;line-height:1.3" dir="ltr">'+han(w.zh,w.py)+'</span><span class="py" dir="ltr">'+(txt||pyhtml(w.py))+'</span><span class="mut">'+w.ar+'</span>'+spkBtn(w.zh,'sm')+'</div>'}
function chipsOf(arr,key,act,lab){return '<div class="chips" style="margin-top:8px">'+arr.map(function(x,i){return '<button class="chip tgl'+(i===G[key]?' on':'')+'" data-act="'+act+'" data-i="'+i+'"><span class="han" style="font-size:20px">'+(lab?lab(x):x.zh)+'</span></button>'}).join('')+'</div>'}
function sentbox(toks,ar,say){return '<div class="sentbox"><div class="zhline">'+toks+'</div><div>'+ar+'</div><div class="tools" style="margin:6px 0 0">'+spkBtn(say,'sm')+'</div></div>'}
function renderGrammar(){
  var h='<div class="sec-h"><h2>القواعد</h2><p>خمسة أنماط من الدرس، ثم الصوتيات.</p></div>';
  var sb=SUBJ[G.s],ad=ADV[G.a],pd=PRED[G.p];

  /* 1: xiang */
  var ar1=ad.zh==='不'?sb.ar+' '+sb.nv+' '+pd.ar:(ad.zh==='也'?sb.ar+' أيضاً '+sb.v+' '+pd.ar:sb.ar+' '+sb.v+' '+pd.ar);
  h+='<h3 class="sub-h" style="margin-top:6px">1. 想 + فعل: أريد أن…</h3><div class="card">'+
    '<div class="formula"><span class="fm">الفاعل</span>+<span class="fm">ظرف</span>+<span class="han">想</span>+<span class="fm">فعل + مفعول</span></div>'+
    '<p class="mut">تعبّر <span class="han">想</span> عن الرغبة أو النيّة وتأتي قبل الفعل. الظروف مثل <span class="han">也</span> و <span class="han">不</span> تأتي قبل <span class="han">想</span>.</p>'+
    chipsOf(SUBJ,'s','s')+chipsOf(ADV,'a','adv',function(x){return x.zh||'∅'})+chipsOf(PRED,'p','pred')+
    sentbox(tok(sb.zh,sb.py)+(ad.zh?tok(ad.zh,ad.py):'')+tok('想','xiǎng')+tok(pd.zh,pd.py)+'<span class="punc">。</span>',ar1+'.',sb.zh+ad.zh+'想'+pd.zh+'。')+
    sentbox(tok('你','nǐ')+tok('想','xiǎng')+tok('买','mǎi')+tok('什么','shén me')+'<span class="punc">？</span>','ماذا تريد أن تشتري؟','你想买什么？')+'</div>';

  /* 2: numbers */
  var nb=NUMB[G.num];
  h+='<h3 class="sub-h">2. الأعداد فوق المئة</h3><div class="card">'+
    '<div class="formula"><span class="fm">الرقم</span>＝<span class="han">百</span>/<span class="han">千</span>/<span class="han">万</span>+<span class="han">零</span> <span class="mut">(عند وجود صفر في الوسط)</span></div>'+
    '<p class="mut">إذا كان في وسط الرقم صفر واحد أو أكثر نقول <span class="han">零</span> مرة واحدة. وفي مثل 110 نذكر <span class="han">一十</span> بعد المئة: <span class="han">一百一十</span>.</p>'+
    chipsOf(NUMB,'num','num',function(x){return x.n})+
    sentbox('<span class="han ltr" style="font-size:30px;font-weight:700">'+nb.n+'</span>',tok(nb.zh,nb.py),nb.zh)+'</div>';

  /* 3: RMB */
  var rb=RMB[G.rmb];
  h+='<h3 class="sub-h">3. العملة الصينية 人民币</h3><div class="card">'+
    '<div class="tiles">'+tile({zh:'元 / 块',py:'yuán / kuài',ar:'يوان (كتابة / كلام)'})+tile({zh:'角 / 毛',py:'jiǎo / máo',ar:'عُشر اليوان'})+tile({zh:'分',py:'fēn',ar:'جزء من مئة'})+'</div>'+
    '<p class="mut" style="margin-top:10px">1 元 ＝ 10 角 ＝ 100 分. نقول <span class="han">两</span> قبل 块 و 毛، ونقول <span class="han">二分</span> مع 分، وفي آخر المبلغ نحذف الوحدة: <span class="han">两毛二</span>.</p>'+
    chipsOf(RMB,'rmb','rmb',function(x){return x.n})+
    sentbox('<span class="han ltr" style="font-size:30px;font-weight:700">'+rb.n+'元</span>',tok(rb.zh,rb.py),rb.zh)+'</div>';

  /* 4: duoshao qian */
  var it=ITEMS[G.it],pt=G.pat;
  var qz=[it.zh+'多少钱一斤？','一斤'+it.zh+'多少钱？',it.zh+'怎么卖？'][pt];
  var qt=[tok(it.zh,it.py)+tok('多少','duō shao')+tok('钱','qián')+tok('一斤','yì jīn'),tok('一斤','yì jīn')+tok(it.zh,it.py)+tok('多少','duō shao')+tok('钱','qián'),tok(it.zh,it.py)+tok('怎么','zěn me')+tok('卖','mài')][pt];
  var qa=['بكم جين (نصف كيلو) من '+it.ar+'؟','بكم جين من '+it.ar+'؟','بكم يُباع '+it.ar.replace(/^ال/,'ال')+'؟'][pt];
  h+='<h3 class="sub-h">4. السؤال عن السعر</h3><div class="card">'+
    '<div class="formula"><span class="fm">السلعة</span>+<span class="han">多少钱</span>+<span class="han">一</span>+<span class="fm">وحدة العد</span></div>'+
    '<p class="mut">ثلاث طرق للسؤال عن السعر: <span class="han">…多少钱一斤？</span> أو <span class="han">一斤…多少钱？</span> أو <span class="han">…怎么卖？</span>. والجواب: السعر + <span class="han">一斤</span>.</p>'+
    chipsOf(ITEMS,'it','it')+
    '<div class="chips" style="margin-top:8px">'+['多少钱一斤','一斤多少钱','怎么卖'].map(function(x,i){return '<button class="chip tgl'+(i===pt?' on':'')+'" data-act="pat" data-i="'+i+'"><span class="han" style="font-size:17px">'+x+'</span></button>'}).join('')+'</div>'+
    sentbox(qt+'<span class="punc">？</span>',qa,qz)+
    sentbox(tok(it.zh,it.py)+tok(it.pr,it.pp)+tok('一斤','yì jīn')+'<span class="punc">。</span>','الجواب: '+it.ar+' بـ '+it.pa+' للجين.',it.zh+it.pr+'一斤。')+'</div>';

  /* 5: yi sandhi */
  var mw=MW[G.mw];
  h+='<h3 class="sub-h">5. تغيّر نغمة 一</h3><div class="card">'+
    '<div class="formula"><span class="han">一</span>+<span class="fm">نغمة رابعة</span>→ <b dir="ltr">yí</b> &nbsp;|&nbsp; <span class="han">一</span>+<span class="fm">نغمة أولى/ثانية/ثالثة</span>→ <b dir="ltr">yì</b></div>'+
    '<p class="mut">تُنطق <span class="han">一</span> وحدها أو في الأرقام <b dir="ltr">yī</b>. لكن قبل وحدة العد تتغير نغمتها بحسب نغمة الكلمة التالية.</p>'+
    chipsOf(MW,'mw','mw')+
    sentbox(tok('一',mw.yi)+tok(mw.zh,mw.py)+'',mw.ar+' — '+(mw.yi==='yí'?'بعد 一 نغمة رابعة، فتصير yí.':'بعد 一 نغمة أولى/ثانية/ثالثة، فتصير yì.'),'一'+mw.zh)+'</div>';

  /* phonetics */
  h+='<h3 class="sub-h">الصوتيات</h3><div class="card"><h3 style="font-size:16px;margin-bottom:4px">قاعدة الكتابة: ü</h3>'+
    '<p class="mut" style="margin-bottom:10px">بعد <b dir="ltr">j ، q ، x</b> تُكتب ü بدون النقطتين: <b dir="ltr">ju ، qu ، xu</b>. أما مع <b dir="ltr">n</b> و <b dir="ltr">l</b> فتبقى النقطتان: <b dir="ltr">nü ، lü</b>.</p>'+
    '<div class="tiles">'+SPELL.map(function(x){return tile(x,esc(x.txt))}).join('')+'</div>'+
    '<h3 style="font-size:16px;margin:18px 0 4px">ميّز بين الأصوات</h3><p class="mut" style="margin-bottom:10px">اسمع كل كلمة وقارن بالثانية (j و zh، q و ch، x و sh، s و x).</p>'+
    PAIRS.map(function(p){return '<div class="tiles" style="margin-bottom:8px">'+tile(p[0])+tile(p[1])+'</div>'}).join('')+'</div>';

  $('#p-grammar').innerHTML=h;
}
