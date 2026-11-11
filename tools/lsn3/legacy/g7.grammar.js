/* ---------- grammar ---------- */
var G={th:0,ld:0,ps:0,hai:0,haiOn:false,wq:0,ba:{},cp:0,pl:0,pos:0};
var THING=[
 {zh:'图书馆',py:'tú shū guǎn',ar:'المكتبة',ai:'مكتبة',v:'تقع'},{zh:'饭馆',py:'fàn guǎn',ar:'المطعم',ai:'مطعم',v:'يقع'},
 {zh:'超市',py:'chāo shì',ar:'السوبرماركت',ai:'سوبرماركت',v:'يقع'},{zh:'体育馆',py:'tǐ yù guǎn',ar:'الصالة الرياضية',ai:'صالة رياضية',v:'تقع'},
 {zh:'商店',py:'shāng diàn',ar:'المتجر',ai:'متجر',v:'يقع'},{zh:'银行',py:'yín háng',ar:'البنك',ai:'بنك',v:'يقع'}
];
var LAND=[
 {zh:'教学楼',py:'jiào xué lóu',ar:'مبنى الدراسة'},{zh:'留学生楼',py:'liú xué shēng lóu',ar:'مبنى الطلاب الدوليين'},
 {zh:'运动场',py:'yùn dòng chǎng',ar:'الملعب'},{zh:'宿舍',py:'sù shè',ar:'السكن'}
];
var POS=[
 {zh:'东边',py:'dōng bian',ar:'شرق'},{zh:'西边',py:'xī bian',ar:'غرب'},{zh:'南边',py:'nán bian',ar:'جنوب'},{zh:'北边',py:'běi bian',ar:'شمال'},
 {zh:'前边',py:'qián bian',ar:'أمام'},{zh:'后边',py:'hòu bian',ar:'خلف'},{zh:'左边',py:'zuǒ bian',ar:'يسار'},{zh:'右边',py:'yòu bian',ar:'يمين'},
 {zh:'里边',py:'lǐ bian',ar:'داخل'},{zh:'外边',py:'wài bian',ar:'خارج'},{zh:'上边',py:'shàng bian',ar:'فوق'},{zh:'下边',py:'xià bian',ar:'تحت'},{zh:'旁边',py:'páng biān',ar:'بجانب'}
];
var HAI=[
 {a:['我有一本书','wǒ yǒu yì běn shū'],b:['有一支笔','yǒu yì zhī bǐ'],ar:'عندي كتاب، وعندي أيضاً قلم.',ar0:'عندي كتاب. عندي قلم.'},
 {a:['我去超市','wǒ qù chāo shì'],b:['去银行','qù yín háng'],ar:'أذهب إلى السوبرماركت، وأذهب أيضاً إلى البنك.',ar0:'أذهب إلى السوبرماركت. أذهب إلى البنك.'},
 {a:['图书馆北边有一个饭馆','tú shū guǎn běi bian yǒu yí ge fàn guǎn'],b:['有一个超市','yǒu yí ge chāo shì'],ar:'شمال المكتبة مطعم، وهناك أيضاً سوبرماركت.',ar0:'شمال المكتبة مطعم. هناك سوبرماركت.'},
 {a:['我学习汉语','wǒ xué xí Hàn yǔ'],b:['学习英语','xué xí Yīng yǔ'],ar:'أدرس الصينية، وأدرس أيضاً الإنجليزية.',ar0:'أدرس الصينية. أدرس الإنجليزية.'}
];
var BA=[
 {zh:'我们一起去超市',py:'wǒ men yì qǐ qù chāo shì',ar:'نحن نذهب معاً إلى السوبرماركت.',arb:'هيا نذهب معاً إلى السوبرماركت.'},
 {zh:'我跟你一起去',py:'wǒ gēn nǐ yì qǐ qù',ar:'أنا أذهب معك.',arb:'سأذهب معك إذن / لأذهب معك.'},
 {zh:'你去图书馆',py:'nǐ qù tú shū guǎn',ar:'أنت تذهب إلى المكتبة.',arb:'اذهب إلى المكتبة (اقتراح).'}
];
var COMP=[{zh:'你',py:'nǐ',ar:'معك'},{zh:'他',py:'tā',ar:'معه'},{zh:'她',py:'tā',ar:'معها'}];
var PLC=[{zh:'图书馆',py:'tú shū guǎn',ar:'المكتبة'},{zh:'银行',py:'yín háng',ar:'البنك'},{zh:'超市',py:'chāo shì',ar:'السوبرماركت'},{zh:'饭馆',py:'fàn guǎn',ar:'المطعم'}];
var SPELL=[
 {zh:'牛',py:'niú',txt:'n + iou → niu',ar:'بقرة'},{zh:'贵',py:'guì',txt:'g + uei → gui',ar:'غالٍ'},{zh:'轮',py:'lún',txt:'l + uen → lun',ar:'عجلة'}
];
var ER=[
 {zh:'哪儿',py:'nǎr',ar:'أين (哪 nǎ + 儿)'},{zh:'这儿',py:'zhèr',ar:'هنا (这 zhè + 儿)'},{zh:'那儿',py:'nàr',ar:'هناك (那 nà + 儿)'},
 {zh:'一点儿',py:'yì diǎnr',ar:'قليلاً'},{zh:'花儿',py:'huār',ar:'زهرة'},{zh:'一会儿',py:'yí huìr',ar:'لحظة'}
];
var PAIRS=[
 [{zh:'吸气',py:'xī qì',ar:'يستنشق'},{zh:'湿气',py:'shī qì',ar:'رطوبة'}],
 [{zh:'鸡心',py:'jī xīn',ar:'قلب دجاجة'},{zh:'知心',py:'zhī xīn',ar:'مقرّب'}],
 [{zh:'稀饭',py:'xī fàn',ar:'عصيدة'},{zh:'吃饭',py:'chī fàn',ar:'يأكل'}],
 [{zh:'旗子',py:'qí zi',ar:'علم'},{zh:'池子',py:'chí zi',ar:'بركة'}],
 [{zh:'嫉妒',py:'jí dù',ar:'يحسد'},{zh:'制度',py:'zhì dù',ar:'نظام'}],
 [{zh:'牺牲',py:'xī shēng',ar:'يضحّي'},{zh:'师生',py:'shī shēng',ar:'معلمون وطلاب'}]
];
function tok(zh,py){return '<span class="tok" style="cursor:default"><span class="py">'+pyhtml(py)+'</span><span class="zh">'+han(zh,py)+'</span></span>'}
function tile(w,txt){return '<div class="tile"><span class="han" style="font-size:24px;line-height:1.3" dir="ltr">'+han(w.zh,w.py)+'</span><span class="py" dir="ltr">'+(txt||pyhtml(w.py))+'</span><span class="mut">'+w.ar+'</span>'+spkBtn(w.zh,'sm')+'</div>'}
function chipsOf(arr,key,act){return '<div class="chips" style="margin-top:8px">'+arr.map(function(x,i){return '<button class="chip tgl'+(i===G[key]?' on':'')+'" data-act="'+act+'" data-i="'+i+'"><span class="han" style="font-size:20px">'+x.zh+'</span></button>'}).join('')+'</div>'}
function sentbox(toks,ar,say){return '<div class="sentbox"><div class="zhline">'+toks+'</div><div>'+ar+'</div><div class="tools" style="margin:6px 0 0">'+spkBtn(say,'sm')+'</div></div>'}
function renderGrammar(){
  var h='<div class="sec-h"><h2>القواعد</h2><p>خمسة أنماط من الدرس، ثم الصوتيات.</p></div>';
  var th=THING[G.th],ld=LAND[G.ld],ps=POS[G.ps];

  /* 1: zai / you */
  h+='<h3 class="sub-h" style="margin-top:6px">1. جملة الوجود: 在 و 有</h3><div class="card">'+
    '<div class="formula"><span class="fm">الشيء</span>+<span class="han">在</span>+<span class="fm">المكان</span></div>'+
    '<div class="formula"><span class="fm">المكان</span>+<span class="han">有</span>+<span class="fm">الشيء</span></div>'+
    '<p class="mut">الجملتان تصفان الموقف نفسه. في 在 نبدأ بالشيء المعروف، وفي 有 نبدأ بالمكان ثم نذكر ما يوجد فيه (غالباً شيء جديد مع 一个).</p>'+
    '<p class="mut" style="margin-top:8px">اختر الشيء، ثم المبنى المرجعي، ثم الجهة:</p>'+
    chipsOf(THING,'th','th')+chipsOf(LAND,'ld','ld')+chipsOf(POS,'ps','ps')+
    sentbox(tok(th.zh,th.py)+tok('在','zài')+tok(ld.zh,ld.py)+tok(ps.zh,ps.py)+'<span class="punc">。</span>',th.ar+' '+th.v+' '+ps.ar+' '+ld.ar+'.',th.zh+'在'+ld.zh+ps.zh+'。')+
    sentbox(tok(ld.zh,ld.py)+tok(ps.zh,ps.py)+tok('有','yǒu')+tok('一','yí')+tok('个','ge')+tok(th.zh,th.py)+'<span class="punc">。</span>',ps.ar+' '+ld.ar+' يوجد '+th.ai+'.',ld.zh+ps.zh+'有一个'+th.zh+'。')+
    '</div>';

  /* position words */
  h+='<h3 class="sub-h">2. كلمات الاتجاه 方位词</h3><div class="card">'+
    '<p class="mut">كلمات الاتجاه تأخذ <span class="han">边</span> في آخرها، ويمكن أن تكون مبتدأ أو خبراً أو صفة: <span class="han">西边有一个饭馆。</span> <span class="han">日本在中国东边。</span> <span class="han">前边的人是山田。</span></p>'+
    '<div class="tiles" style="margin-top:10px">'+POS.map(function(x){return tile({zh:x.zh,py:x.py,ar:x.ar})}).join('')+'</div></div>';

  /* 3: hai */
  var hi=HAI[G.hai],hz=hi.a[0]+'，'+(G.haiOn?'还':'')+hi.b[0]+'。',hp=hi.a[1]+', '+(G.haiOn?'hái ':'')+hi.b[1]+'.';
  h+='<h3 class="sub-h">3. 还 تعني «أيضاً»</h3><div class="card">'+
    '<div class="formula"><span class="fm">الجملة الأولى</span>，<span class="han">还</span>+<span class="fm">الفعل + الإضافة</span></div>'+
    '<p class="mut">تضيف <span class="han">还</span> شيئاً آخر إلى ما سبق، وتأتي قبل الفعل مباشرة.</p>'+
    '<div class="chips" style="margin-top:8px">'+HAI.map(function(x,i){return '<button class="chip tgl'+(i===G.hai?' on':'')+'" data-act="hai" data-i="'+i+'">'+(i+1)+'</button>'}).join('')+'<button class="chip tgl'+(G.haiOn?' on':'')+'" data-act="haion"><span class="han">还</span> '+(G.haiOn?'مضافة':'أضِفها')+'</button></div>'+
    sentbox(tok(hz,hp.replace(/\.$/,''))+'',G.haiOn?hi.ar:hi.ar0,hz)+'</div>';

  /* 4: nar / shenme difang */
  h+='<h3 class="sub-h">4. السؤال عن المكان</h3><div class="card">'+
    '<div class="formula"><span class="fm">الشيء</span>+<span class="han">在</span>+<span class="han">哪儿</span> / <span class="han">什么地方</span></div>'+
    '<p class="mut">استعمل <span class="han">哪儿</span> أو <span class="han">什么地方</span> للسؤال عن المكان، والجواب يبدأ بـ <span class="han">在</span>.</p>'+
    chipsOf(THING,'th','th')+
    sentbox(tok(th.zh,th.py)+tok('在','zài')+tok('哪儿','nǎr')+'<span class="punc">？</span>','أين '+th.ar+'؟',th.zh+'在哪儿？')+
    sentbox(tok(th.zh,th.py)+tok('在','zài')+tok('什么','shén me')+tok('地方','dì fang')+'<span class="punc">？</span>','في أي مكان '+th.ar+'؟',th.zh+'在什么地方？')+
    sentbox(tok('在','zài')+tok(ld.zh,ld.py)+tok(ps.zh,ps.py)+'<span class="punc">。</span>','الجواب: '+ps.ar+' '+ld.ar+'.','在'+ld.zh+ps.zh+'。')+
    '</div>';

  /* 5: ba and gen yiqi */
  var b=BA[G.pos%BA.length],on=!!G.ba[G.pos%BA.length];
  var cp=COMP[G.cp],pl=PLC[G.pl];
  h+='<h3 class="sub-h">5. 吧 و 跟……一起</h3><div class="card">'+
    '<div class="formula"><span class="fm">الجملة</span><span class="han">吧</span><span class="mut">(اقتراح)</span></div>'+
    '<p class="mut">تأتي <span class="han">吧</span> في نهاية الجملة لتجعلها اقتراحاً أو دعوة لطيفة. اضغط لترى الفرق:</p>'+
    '<div class="chips" style="margin-top:8px">'+BA.map(function(x,i){return '<button class="chip tgl'+(i===G.pos%BA.length?' on':'')+'" data-act="bapick" data-i="'+i+'">'+(i+1)+'</button>'}).join('')+'<button class="chip tgl'+(on?' on':'')+'" data-act="baon"><span class="han">吧</span> '+(on?'مضافة':'أضِفها')+'</button></div>'+
    sentbox(tok(b.zh,b.py)+(on?tok('吧','ba'):'')+'<span class="punc">。</span>',on?b.arb:b.ar,b.zh+(on?'吧':'')+'。')+
    '<h3 style="font-size:16px;margin:18px 0 4px">跟……一起</h3><div class="formula"><span class="han">我</span>+<span class="han">跟</span>+<span class="fm">الشخص</span>+<span class="han">一起</span>+<span class="han">去</span>+<span class="fm">المكان</span></div>'+
    '<div class="chips" style="margin-top:8px">'+COMP.map(function(x,i){return '<button class="chip tgl'+(i===G.cp?' on':'')+'" data-act="cp" data-i="'+i+'"><span class="han" style="font-size:20px">'+x.zh+'</span></button>'}).join('')+'</div>'+
    '<div class="chips" style="margin-top:8px">'+PLC.map(function(x,i){return '<button class="chip tgl'+(i===G.pl?' on':'')+'" data-act="pl" data-i="'+i+'"><span class="han" style="font-size:20px">'+x.zh+'</span></button>'}).join('')+'</div>'+
    sentbox(tok('我','wǒ')+tok('跟','gēn')+tok(cp.zh,cp.py)+tok('一起','yì qǐ')+tok('去','qù')+tok(pl.zh,pl.py)+tok('吧','ba')+'<span class="punc">。</span>','سأذهب '+cp.ar+' إلى '+pl.ar+'.','我跟'+cp.zh+'一起去'+pl.zh+'吧。')+'</div>';

  /* phonetics */
  h+='<h3 class="sub-h">الصوتيات</h3><div class="card"><h3 style="font-size:16px;margin-bottom:4px">قاعدة الكتابة: iou ، uei ، uen</h3>'+
    '<p class="mut" style="margin-bottom:10px">بعد الحرف الأول تُكتب هذه الأصوات مختصرة: <b dir="ltr">iou → iu</b> ، <b dir="ltr">uei → ui</b> ، <b dir="ltr">uen → un</b>.</p>'+
    '<div class="tiles">'+SPELL.map(function(x){return tile(x,esc(x.txt))}).join('')+'</div>'+
    '<h3 style="font-size:16px;margin:18px 0 4px">ـ儿 الحرف المدمَج 儿化</h3>'+
    '<p class="mut" style="margin-bottom:10px">تُنطق 儿 مع المقطع الذي قبلها كمقطع واحد، وتُكتب في البينيين بحرف <b dir="ltr">r</b> فقط: <b dir="ltr">nǎr</b>.</p>'+
    '<div class="tiles">'+ER.map(function(x){return tile(x)}).join('')+'</div>'+
    '<h3 style="font-size:16px;margin:18px 0 4px">ميّز بين الأصوات</h3><p class="mut" style="margin-bottom:10px">اسمع كل كلمة وقارن بالثانية (x و sh، q و ch، j و zh).</p>'+
    PAIRS.map(function(p){return '<div class="tiles" style="margin-bottom:8px">'+tile(p[0])+tile(p[1])+'</div>'}).join('')+'</div>';

  $('#p-grammar').innerHTML=h;
}
