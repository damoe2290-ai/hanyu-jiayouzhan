/* ---------- grammar ---------- */
var G={neg:[false,false,false],m:9,d:28,w:1,qa:[null,null,null],own:0,thg:0};
var MDAYS=[31,29,31,30,31,30,31,31,30,31,30,31];
var MON=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
var WD=[
 {zh:'星期一',py:'xīng qī yī',ar:'الاثنين'},{zh:'星期二',py:'xīng qī èr',ar:'الثلاثاء'},{zh:'星期三',py:'xīng qī sān',ar:'الأربعاء'},
 {zh:'星期四',py:'xīng qī sì',ar:'الخميس'},{zh:'星期五',py:'xīng qī wǔ',ar:'الجمعة'},{zh:'星期六',py:'xīng qī liù',ar:'السبت'},{zh:'星期日',py:'xīng qī rì',ar:'الأحد'}
];
var DP=['','yī','èr','sān','sì','wǔ','liù','qī','bā','jiǔ','shí'];
var DZ=['零','一','二','三','四','五','六','七','八','九','十'];
function numZh(n){if(n<=10)return DZ[n];if(n<20)return '十'+DZ[n-10];var t=Math.floor(n/10),u=n%10;return DZ[t]+'十'+(u?DZ[u]:'')}
function numPy(n){if(n<=10)return DP[n];if(n<20)return 'shí '+DP[n-10];var t=Math.floor(n/10),u=n%10;return DP[t]+' shí'+(u?' '+DP[u]:'')}
function tok(zh,py){return '<span class="tok" style="cursor:default"><span class="py">'+pyhtml(py)+'</span><span class="zh">'+han(zh,py)+'</span></span>'}
function spokenZh(){return numZh(G.m)+'月'+numZh(G.d)+'号，'+WD[G.w].zh}

var NP=[
 {pre:'今天',pred:'星期五',pyPre:'Jīntiān',pyPred:'xīngqīwǔ',ar:'اليوم الجمعة',arn:'اليوم ليس الجمعة'},
 {pre:'我妈妈',pred:'四十岁',pyPre:'Wǒ māma',pyPred:'sìshí suì',ar:'عمر أمي أربعون سنة',arn:'عمر أمي ليس أربعين سنة'},
 {pre:'今天',pred:'九月二十八号',pyPre:'Jīntiān',pyPred:'jiǔ yuè èrshíbā hào',ar:'اليوم 28 سبتمبر',arn:'اليوم ليس 28 سبتمبر'}
];
var QC=[
 {q:{zh:'你是学生，对吗？',py:'Nǐ shì xuésheng, duì ma?',ar:'أنت طالب، صحيح؟'},
  yes:{zh:'对，我是学生。',py:'Duì, wǒ shì xuésheng.',ar:'صحيح، أنا طالب.'},
  no:{zh:'不，我不是学生。',py:'Bù, wǒ bú shì xuésheng.',ar:'لا، لست طالباً.'}},
 {q:{zh:'今天是星期二，对吗？',py:"Jīntiān shì xīngqī'èr, duì ma?",ar:'اليوم الثلاثاء، صحيح؟'},
  yes:{zh:'对，今天是星期二。',py:"Duì, jīntiān shì xīngqī'èr.",ar:'صحيح، اليوم الثلاثاء.'},
  no:{zh:'不，今天是星期三。',py:'Bù, jīntiān shì xīngqīsān.',ar:'لا، اليوم الأربعاء.'}},
 {q:{zh:'你的生日是九月十七号，对吗？',py:'Nǐ de shēngrì shì jiǔ yuè shíqī hào, duì ma?',ar:'عيد ميلادك 17 سبتمبر، صحيح؟'},
  yes:{zh:'对，是九月十七号。',py:'Duì, shì jiǔ yuè shíqī hào.',ar:'صحيح، 17 سبتمبر.'},
  no:{zh:'不，是九月十八号。',py:'Bù, shì jiǔ yuè shíbā hào.',ar:'لا، 18 سبتمبر.'}}
];
var ZMY=[
 {q:'我们请你吃饭，怎么样？',qpy:'Wǒmen qǐng nǐ chī fàn, zěnmeyàng?',qar:'ندعوك إلى الطعام، ما رأيك؟',a:'太好了！',apy:'Tài hǎo le!',aar:'رائع!'},
 {q:'我们一起去，怎么样？',qpy:'Wǒmen yìqǐ qù, zěnmeyàng?',qar:'نذهب معاً، ما رأيك؟',a:'行。',apy:'Xíng.',aar:'موافق.'},
 {q:'你们都去我家，怎么样？',qpy:'Nǐmen dōu qù wǒ jiā, zěnmeyàng?',qar:'تذهبون جميعاً إلى بيتي، ما رأيك؟',a:'好啊。',apy:'Hǎo a.',aar:'حسناً.'}
];
var OWN=[
 {zh:'我',py:'wǒ',k:'我'},{zh:'你',py:'nǐ',k:'你'},{zh:'他',py:'tā',k:'他'},{zh:'我们',py:'wǒ men',k:'我们'},
 {zh:'林娜',py:'Lín nà',name:'لينا'},{zh:'马丁',py:'Mǎ dīng',name:'مارتن'}
];
var THG=[
 {zh:'书',py:'shū',base:'كتاب',def:'الكتاب',h:'هذا',f:{'我':'كتابي','你':'كتابك','他':'كتابه','我们':'كتابنا'}},
 {zh:'笔',py:'bǐ',base:'قلم',def:'القلم',h:'هذا',f:{'我':'قلمي','你':'قلمك','他':'قلمه','我们':'قلمنا'}},
 {zh:'礼物',py:'lǐ wù',base:'هدية',def:'الهدية',h:'هذه',f:{'我':'هديتي','你':'هديتك','他':'هديته','我们':'هديتنا'}},
 {zh:'衣服',py:'yī fu',base:'ملابس',def:'الملابس',h:'هذه',f:{'我':'ملابسي','你':'ملابسك','他':'ملابسه','我们':'ملابسنا'}},
 {zh:'生日',py:'shēng rì',base:'عيد ميلاد',def:'عيد الميلاد',lead:'今天是',leadPy:'jīn tiān shì',h:'اليوم',f:{'我':'عيد ميلادي','你':'عيد ميلادك','他':'عيد ميلاده','我们':'عيد ميلادنا'}}
];
var PH1=[
 {zh:'西医',py:'xī yī',ar:'الطب الغربي'},{zh:'今天',py:'jīn tiān',ar:'اليوم'},{zh:'星期',py:'xīng qī',ar:'أسبوع'},
 {zh:'香蕉',py:'xiāng jiāo',ar:'موز'},{zh:'医生',py:'yī shēng',ar:'طبيب'},{zh:'飞机',py:'fēi jī',ar:'طائرة'}
];
var PH2=[
 {zh:'中国',py:'Zhōng guó',ar:'الصين'},{zh:'生活',py:'shēng huó',ar:'حياة'},{zh:'公园',py:'gōng yuán',ar:'حديقة'},
 {zh:'踢球',py:'tī qiú',ar:'يلعب الكرة'},{zh:'今年',py:'jīn nián',ar:'هذا العام'},{zh:'欢迎',py:'huān yíng',ar:'يرحّب'}
];
var SYLD=[
 {zh:'第二',py:'dì èr',txt:"dì'èr",ar:'الثاني'},{zh:'西安',py:'Xī ān',txt:"Xī'ān",ar:'شيان (مدينة)'},
 {zh:'星期二',py:'xīng qī èr',txt:"xīngqī'èr",ar:'الثلاثاء'},{zh:'皮袄',py:'pí ǎo',txt:"pí'ǎo",ar:'معطف جلدي'}
];
function tile(w,txt){return '<div class="tile"><span class="han" style="font-size:24px;line-height:1.3" dir="ltr">'+han(w.zh,w.py)+'</span><span class="py" dir="ltr">'+(txt||pyhtml(w.py))+'</span><span class="mut">'+w.ar+'</span>'+spkBtn(w.zh,'sm')+'</div>'}

function renderGrammar(){
  var h='<div class="sec-h"><h2>القواعد</h2><p>خمسة أنماط من الدرس، ثم الصوتيات.</p></div>';

  /* 1 noun predicate */
  h+='<h3 class="sub-h" style="margin-top:6px">1. الجملة ذات الخبر الاسمي</h3><div class="card">'+
    '<div class="formula"><span class="fm">المبتدأ</span>+<span class="fm">الخبر</span><span class="mut">(بلا 是)</span></div>'+
    '<p class="mut">مع التاريخ والعمر والأعداد لا نضع <span class="han">是</span> بين المبتدأ والخبر. وللنفي نضع <span class="han">不是</span> قبل الخبر.</p>'+
    NP.map(function(n,i){
      var on=G.neg[i],zh=n.pre+(on?'不是':'')+n.pred;
      var py=n.pyPre+(on?' bú shì ':' ')+n.pyPred;
      return '<div class="sentbox"><div class="han" style="font-size:26px;line-height:1.5" dir="ltr">'+esc(n.pre)+(on?'<span class="qmark">不是</span>':'')+esc(n.pred)+'。</div>'+
        '<div class="mut py" dir="ltr">'+py+'.</div><div>'+(on?n.arn:n.ar)+'.</div>'+
        '<div class="tools" style="margin:6px 0 0"><button class="btn ghost sm" data-act="neg" data-i="'+i+'">'+(on?'ارجع إلى المثبت':'حوّلها إلى النفي')+'</button>'+spkBtn(zh+'。','sm')+'</div></div>';
    }).join('')+'</div>';

  /* 2 dates */
  var m=G.m,d=G.d,w=WD[G.w];
  var mz=numZh(m)+'月',mp=numPy(m)+' yuè',dw=numZh(d)+'日',dwp=numPy(d)+' rì',ds=numZh(d)+'号',dsp=numPy(d)+' hào';
  h+='<h3 class="sub-h">2. التاريخ</h3><div class="card">'+
    '<div class="formula"><span class="fm">年 السنة</span>←<span class="fm">月 الشهر</span>←<span class="fm">日 / 号 اليوم</span>←<span class="fm">星期 الأسبوع</span></div>'+
    '<p class="mut">يُكتب اليوم <span class="han">日</span> وفي الكلام نقول <span class="han">号</span>. اختر الشهر واليوم ويوم الأسبوع:</p>'+
    '<div class="chips" style="margin-top:10px">'+[1,2,3,4,5,6,7,8,9,10,11,12].map(function(x){return '<button class="chip tgl'+(x===m?' on':'')+'" style="min-width:44px" data-act="gm" data-i="'+x+'">'+x+'</button>'}).join('')+'</div>'+
    '<div class="tools" style="margin:12px 0"><span class="mut">اليوم من الشهر</span><div class="stepper"><button class="btn ghost sm" data-act="gd" data-s="-1" aria-label="اليوم السابق">−</button><b>'+d+'</b><button class="btn ghost sm" data-act="gd" data-s="1" aria-label="اليوم التالي">+</button></div><button class="btn ghost sm" data-act="gtoday">تاريخ اليوم</button></div>'+
    '<div class="chips">'+WD.map(function(x,i){return '<button class="chip tgl'+(i===G.w?' on':'')+'" data-act="gw" data-i="'+i+'"><span style="font-size:13px">'+x.ar+'</span><span class="han" style="font-size:16px">'+x.zh+'</span></button>'}).join('')+'</div>'+
    '<div class="sentbox"><span class="mut">كتابةً</span><div class="zhline">'+tok(mz,mp)+tok(dw,dwp)+tok(w.zh,w.py)+'</div>'+
    '<span class="mut">كلاماً</span><div class="zhline">'+tok(mz,mp)+tok(ds,dsp)+tok(w.zh,w.py)+'</div>'+
    '<div>'+w.ar+' '+d+' '+MON[m-1]+'</div><div class="tools" style="margin:6px 0 0">'+spkBtn(spokenZh(),'sm')+'</div></div>'+
    '<p class="mut" style="margin-top:12px">للسؤال: <span class="han">今天几号？</span> (كم اليوم من الشهر؟) و <span class="han">今天星期几？</span> (أي يوم من الأسبوع؟)</p>'+
    '<div class="qa"><div class="m">'+spkBtn('今天几号？今天三月八号。','sm')+'<div class="t"><span class="z" dir="ltr">今天几号？ 今天三月八号。</span><span class="mut py" dir="ltr">Jīntiān jǐ hào? Jīntiān sān yuè bā hào.</span><span>كم اليوم؟ اليوم 8 مارس.</span></div></div>'+
    '<div class="m">'+spkBtn('今天星期几？今天星期六。','sm')+'<div class="t"><span class="z" dir="ltr">今天星期几？ 今天星期六。</span><span class="mut py" dir="ltr">Jīntiān xīngqī jǐ? Jīntiān xīngqīliù.</span><span>أي يوم اليوم؟ اليوم السبت.</span></div></div></div></div>';

  /* 3 duì ma */
  h+='<h3 class="sub-h">3. …，对吗؟ للتأكّد</h3><div class="card">'+
    '<div class="formula"><span class="fm">جملة</span>+<span class="fm k">对吗？</span></div>'+
    '<p class="mut">يسأل المتكلم وهو يظن أنه يعرف الإجابة. نجيب <span class="han">对，……</span> أو <span class="han">不，……</span>.</p>'+
    QC.map(function(c,i){
      var a=G.qa[i];
      return '<div class="sentbox"><div class="han" style="font-size:24px;line-height:1.5" dir="ltr">'+c.q.zh+'</div><div class="mut py" dir="ltr">'+c.q.py+'</div><div>'+c.q.ar+'</div>'+
        '<div class="tools" style="margin:6px 0 0">'+spkBtn(c.q.zh,'sm')+'<button class="chip tgl'+(a==='yes'?' on':'')+'" data-act="qy" data-i="'+i+'" data-k="yes">إجابة بنعم</button><button class="chip tgl'+(a==='no'?' on':'')+'" data-act="qy" data-i="'+i+'" data-k="no">إجابة بلا</button></div>'+
        (a?'<div class="m" style="display:flex;align-items:center;gap:10px;margin-top:6px">'+spkBtn(c[a].zh,'sm')+'<div class="t" style="display:grid"><span class="han" style="font-size:22px" dir="ltr">'+c[a].zh+'</span><span class="mut py" dir="ltr">'+c[a].py+'</span><span>'+c[a].ar+'</span></div></div>':'')+'</div>';
    }).join('')+'</div>';

  /* 4 zenmeyang */
  h+='<h3 class="sub-h">4. …，怎么样؟ لطلب الرأي</h3><div class="card">'+
    '<div class="formula"><span class="fm">اقتراح</span>+<span class="fm k">怎么样？</span></div>'+
    '<p class="mut">تأتي في آخر الجملة، ويمكن فصلها بفاصلة. للموافقة نقول <span class="han">好</span> أو <span class="han">好啊</span> أو <span class="han">行</span> أو <span class="han">太好了</span>.</p>'+
    '<div class="qa">'+ZMY.map(function(z){
      return '<div class="m">'+spkBtn(z.q+z.a,'sm')+'<div class="t"><span class="z" dir="ltr">'+z.q+'</span><span class="mut py" dir="ltr">'+z.qpy+'</span><span>'+z.qar+'</span>'+
        '<span class="z" dir="ltr" style="margin-top:6px">'+z.a+'</span><span class="mut py" dir="ltr">'+z.apy+'</span><span>'+z.aar+'</span></div></div>';
    }).join('')+'</div></div>';

  /* 5 attributive */
  var o=OWN[G.own],t=THG[G.thg];
  var lead=t.lead||'这是',leadPy=t.leadPy||'zhè shì';
  var arForm=o.name?(t.base+' '+o.name):t.f[o.k];
  var arS=t.h+' '+arForm;
  var qAr=t.lead?'عيد ميلاد من اليوم؟':'لمن '+t.h+' '+t.def+'؟';
  h+='<h3 class="sub-h">5. المالك + 的 + الشيء</h3><div class="card">'+
    '<div class="formula"><span class="fm">المالك</span>+<span class="fm k">的</span>+<span class="fm">الشيء</span></div>'+
    '<p class="mut">للسؤال نضع <span class="han">谁</span> مكان المالك. اختر المالك والشيء:</p>'+
    '<div class="chips" style="margin-top:10px">'+OWN.map(function(x,i){return '<button class="chip tgl'+(i===G.own?' on':'')+'" data-act="own" data-i="'+i+'"><span class="han" style="font-size:20px">'+x.zh+'</span></button>'}).join('')+'</div>'+
    '<div class="chips" style="margin-top:8px">'+THG.map(function(x,i){return '<button class="chip tgl'+(i===G.thg?' on':'')+'" data-act="thg" data-i="'+i+'"><span class="han" style="font-size:20px">'+x.zh+'</span></button>'}).join('')+'</div>'+
    '<div class="sentbox"><div class="zhline">'+tok(lead,leadPy)+tok(o.zh,o.py)+tok('的','de')+tok(t.zh,t.py)+'<span class="punc">。</span></div><div>'+arS+'.</div>'+
    '<div class="tools" style="margin:6px 0 0">'+spkBtn(lead+o.zh+'的'+t.zh+'。','sm')+'</div></div>'+
    '<div class="sentbox"><div class="zhline">'+tok(lead,leadPy)+tok('谁','shéi')+tok('的','de')+tok(t.zh,t.py)+'<span class="punc">？</span></div><div>'+qAr+'</div>'+
    '<div class="tools" style="margin:6px 0 0">'+spkBtn(lead+'谁的'+t.zh+'？','sm')+'</div></div></div>';

  /* phonetics */
  h+='<h3 class="sub-h">الصوتيات</h3><div class="card"><h3 style="font-size:16px;margin-bottom:4px">علامة الفصل ( \' )</h3>'+
    '<p class="mut" style="margin-bottom:10px">إذا جاء مقطع يبدأ بـ a أو o أو e بعد مقطع آخر، نضع علامة الفصل حتى لا تختلط المقاطع.</p>'+
    '<div class="tiles">'+SYLD.map(function(x){return tile(x,esc(x.txt))}).join('')+'</div>'+
    '<h3 style="font-size:16px;margin:18px 0 4px">نغمة أولى + نغمة أولى</h3><div class="tiles">'+PH1.map(function(x){return tile(x)}).join('')+'</div>'+
    '<h3 style="font-size:16px;margin:18px 0 4px">نغمة أولى + نغمة ثانية</h3><div class="tiles">'+PH2.map(function(x){return tile(x)}).join('')+'</div></div>';

  $('#p-grammar').innerHTML=h;
}
