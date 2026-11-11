/* ---------- content ---------- */
var VOCAB=[
 {zh:'今天',py:'jīn tiān',ar:'اليوم',ex:['今天星期二。',"Jīntiān xīngqī'èr.",'اليوم الثلاثاء.']},
 {zh:'月',py:'yuè',ar:'شهر',ex:['今天九月二十八号。','Jīntiān jiǔ yuè èrshíbā hào.','اليوم 28 سبتمبر.']},
 {zh:'日',py:'rì',ar:'يوم (في التاريخ المكتوب)',note:'في الكلام نقول 号 بدلاً منها.',ex:['今天十月三日。','Jīntiān shí yuè sān rì.','اليوم 3 أكتوبر.']},
 {zh:'星期',py:'xīng qī',ar:'أسبوع / يوم الأسبوع',note:'يليها رقم: 星期一 الاثنين ... 星期日 الأحد.',ex:['今天星期几？','Jīntiān xīngqī jǐ?','أي يوم من الأسبوع اليوم؟']},
 {zh:'的',py:'de',ar:'أداة الإضافة (的)',note:'تأتي بعد المالك وقبل الشيء: 我的书.',ex:['这是我的书。','Zhè shì wǒ de shū.','هذا كتابي.']},
 {zh:'生日',py:'shēng rì',ar:'عيد الميلاد',ex:['今天是我的生日。','Jīntiān shì wǒ de shēngrì.','اليوم عيد ميلادي.']},
 {zh:'下课',py:'xià kè',ar:'تنتهي الحصة',ex:['下课以后，我去吃饭。','Xià kè yǐhòu, wǒ qù chī fàn.','بعد انتهاء الحصة أذهب لتناول الطعام.']},
 {zh:'以后',py:'yǐ hòu',ar:'بعد / لاحقاً',ex:['以后我们一起吃饭。','Yǐhòu wǒmen yìqǐ chī fàn.','لاحقاً نأكل معاً.']},
 {zh:'准备',py:'zhǔn bèi',ar:'يخطط / يجهّز',ex:['他准备礼物。','Tā zhǔnbèi lǐwù.','هو يجهّز هدية.']},
 {zh:'请',py:'qǐng',ar:'يدعو (إلى الطعام)',ex:['我请你吃饭。','Wǒ qǐng nǐ chī fàn.','أدعوك إلى الطعام.']},
 {zh:'吃',py:'chī',ar:'يأكل',ex:['你吃什么？','Nǐ chī shénme?','ماذا تأكل؟']},
 {zh:'饭',py:'fàn',ar:'طعام / وجبة',ex:['我们吃饭吧。','Wǒmen chī fàn ba.','لنأكل.']},
 {zh:'对',py:'duì',ar:'صحيح',ex:['今天星期二，对吗？',"Jīntiān xīngqī'èr, duì ma?",'اليوم الثلاثاء، صحيح؟']},
 {zh:'号',py:'hào',ar:'رقم اليوم (في الكلام)',ex:['今天十号。','Jīntiān shí hào.','اليوم العاشر.']},
 {zh:'怎么样',py:'zěn me yàng',ar:'ما رأيك؟',note:'تأتي في آخر الجملة لطلب الرأي.',ex:['我们一起去，怎么样？','Wǒmen yìqǐ qù, zěnmeyàng?','نذهب معاً، ما رأيك؟']},
 {zh:'祝',py:'zhù',ar:'يتمنى',ex:['祝你生日快乐！','Zhù nǐ shēngrì kuàilè!','عيد ميلاد سعيد!']},
 {zh:'快乐',py:'kuài lè',ar:'سعيد',ex:['祝你快乐！','Zhù nǐ kuàilè!','أتمنى لك السعادة!']},
 {zh:'礼物',py:'lǐ wù',ar:'هدية',ex:['这是我的礼物。','Zhè shì wǒ de lǐwù.','هذه هديتي.']},
 {zh:'本',py:'běn',ar:'وحدة عدّ للكتب',ex:['我有两本书。','Wǒ yǒu liǎng běn shū.','عندي كتابان.']},
 {zh:'书',py:'shū',ar:'كتاب',ex:['这是谁的书？','Zhè shì shéi de shū?','لمن هذا الكتاب؟']},
 {zh:'支',py:'zhī',ar:'وحدة عدّ للأقلام',ex:['我有一支笔。','Wǒ yǒu yì zhī bǐ.','عندي قلم.']},
 {zh:'笔',py:'bǐ',ar:'قلم',ex:['这是他的笔。','Zhè shì tā de bǐ.','هذا قلمه.']},
 {zh:'啊',py:'a',ar:'أداة موافقة',note:'تأتي في آخر الجملة للتعبير عن الموافقة.',ex:['好啊！','Hǎo a!','حسناً! موافق.']},
 {zh:'时间',py:'shí jiān',ar:'وقت',ex:['你有时间吗？','Nǐ yǒu shíjiān ma?','هل عندك وقت؟']},
 {zh:'没问题',py:'méi wèn tí',ar:'لا مشكلة',ex:['星期日？没问题。','Xīngqīrì? Méi wèntí.','يوم الأحد؟ لا مشكلة.']},
 {zh:'没有',py:'méi yǒu',ar:'ليس عنده',note:'تُختصر أحياناً إلى 没.',ex:['我没有时间。','Wǒ méiyǒu shíjiān.','ليس عندي وقت.']},
 {zh:'问题',py:'wèn tí',ar:'سؤال / مشكلة',ex:['你有问题吗？','Nǐ yǒu wèntí ma?','هل عندك سؤال؟']},
 {zh:'中文',py:'Zhōng wén',ar:'اللغة الصينية',ex:['我学中文。','Wǒ xué Zhōngwén.','أدرس الصينية.']},
 {zh:'明天',py:'míng tiān',ar:'غداً',sup:1,ex:['明天星期三。','Míngtiān xīngqīsān.','غداً الأربعاء.']},
 {zh:'后天',py:'hòu tiān',ar:'بعد غد',sup:1,ex:['后天星期四。','Hòutiān xīngqīsì.','بعد غد الخميس.']},
 {zh:'昨天',py:'zuó tiān',ar:'أمس',sup:1,ex:['昨天星期一。','Zuótiān xīngqīyī.','أمس الاثنين.']},
 {zh:'前天',py:'qián tiān',ar:'أول أمس',sup:1,ex:['前天星期日。','Qiántiān xīngqīrì.','أول أمس الأحد.']},
 {zh:'报纸',py:'bào zhǐ',ar:'جريدة',sup:1,ex:['这是报纸。','Zhè shì bàozhǐ.','هذه جريدة.']},
 {zh:'杂志',py:'zá zhì',ar:'مجلة',sup:1,ex:['这是杂志。','Zhè shì zázhì.','هذه مجلة.']},
 {zh:'衣服',py:'yī fu',ar:'ملابس',sup:1,ex:['这是我的衣服。','Zhè shì wǒ de yīfu.','هذه ملابسي.']}
];
var TOKPY={};VOCAB.forEach(function(v){TOKPY[v.zh]=v.py});
var EXTRA={'好':'hǎo','阿里':'Ā lǐ','林娜':'Lín nà','妈妈的':'mā ma de','什么礼物':'shén me lǐ wù','下课以后':'xià kè yǐ hòu','吃饭':'chī fàn','一起':'yì qǐ','吧':'ba','我们':'wǒ men','九月':'jiǔ yuè','二日':'èr rì','这':'zhè','谁':'shéi','你':'nǐ','我':'wǒ','他':'tā','买':'mǎi','有':'yǒu','吗':'ma','几':'jǐ'};
Object.keys(EXTRA).forEach(function(k){if(!TOKPY[k])TOKPY[k]=EXTRA[k]});
function vid(zh){for(var i=0;i<VOCAB.length;i++){if(VOCAB[i].zh===zh)return i}return -1}
/* ---------- illustrations (original drawings) ---------- */
var ICON={
 cal:function(){return '<rect class="w" x="9" y="13" width="46" height="42" rx="6"/><path class="r" d="M9 19a6 6 0 0 1 6-6h34a6 6 0 0 1 6 6v7H9z"/><path d="M22 8v10M42 8v10"/><path d="M18 35h6M29 35h6M40 35h6M18 45h6M29 45h6"/>'},
 calnum:function(t,h){return '<rect class="w" x="9" y="13" width="46" height="42" rx="6"/><path class="r" d="M9 19a6 6 0 0 1 6-6h34a6 6 0 0 1 6 6v7H9z"/><path d="M22 8v10M42 8v10"/><text x="32" y="49" text-anchor="middle" class="k" style="font:700 '+(h?'22px var(--font-han)':'20px var(--font-py)')+'">'+t+'</text>'},
 week:function(){return '<rect class="w" x="6" y="22" width="52" height="20" rx="4"/><rect class="r" x="35.7" y="22" width="7.4" height="20"/><path d="M13.4 22v20M20.9 22v20M28.3 22v20M35.7 22v20M43.1 22v20M50.6 22v20"/>'},
 tl:function(i){var s='<path d="M6 36H58"/>';for(var k=0;k<5;k++){var x=9+k*11.5;s+='<circle class="'+(k===i?'r':'b')+'" cx="'+x+'" cy="36" r="'+(k===i?7:4.5)+'"/>'}return s},
 cake:function(){return '<rect class="y" x="10" y="36" width="44" height="18" rx="4"/><path class="w" d="M10 40c6 6 8-2 14 2s8-4 14 0 8-4 16 0v-6a4 4 0 0 0-4-4H14a4 4 0 0 0-4 4z"/><rect class="r" x="30" y="18" width="4" height="12"/><path class="y" d="M32 7c3 4 3 6 0 8-3-2-3-4 0-8z"/>'},
 gift:function(){return '<rect class="a" x="10" y="28" width="44" height="26" rx="3"/><rect class="a" x="7" y="20" width="50" height="10" rx="3"/><path class="r" d="M29 20h6v34h-6z"/><path class="r" d="M32 20c-6-10-16-6-11-2 3 2 7 2 11 2zM32 20c6-10 16-6 11-2-3 2-7 2-11 2z"/>'},
 book:function(){return '<path class="a" d="M12 12h30a6 6 0 0 1 6 6v34H18a6 6 0 0 1-6-6z"/><path d="M12 46a6 6 0 0 1 6-6h30"/><path d="M22 22h18M22 29h12"/>'},
 pen:function(){return '<g transform="rotate(45 32 32)"><rect class="y" x="27" y="6" width="10" height="34" rx="3"/><path class="w" d="M27 40h10l-5 16z"/><path d="M27 14h10"/></g>'},
 bowl:function(){return '<path class="a" d="M8 30h48c0 14-10 24-24 24S8 44 8 30z"/><path class="w" d="M13 30c1-10 9-15 19-15s18 5 19 15z"/><path d="M42 6l-8 18M48 9l-8 17"/>'},
 news:function(){return '<rect class="w" x="8" y="12" width="48" height="40" rx="4"/><rect class="b" x="14" y="18" width="36" height="8" rx="1"/><rect class="a" x="14" y="31" width="14" height="14"/><path d="M33 33h17M33 39h17M33 45h12"/>'},
 mag:function(){return '<rect class="y" x="16" y="8" width="32" height="48" rx="3"/><rect class="w" x="21" y="14" width="22" height="9" rx="1"/><circle class="r" cx="32" cy="38" r="8"/><path d="M22 51h20"/>'},
 shirt:function(){return '<path class="a" d="M22 10L8 18l6 10 6-3v27h24V25l6 3 6-10-14-8c-2 4-6 6-10 6s-8-2-10-6z"/>'},
 clock:function(){return '<circle class="w" cx="32" cy="32" r="22"/><path d="M32 18v14l9 6"/><circle class="k" cx="32" cy="32" r="2"/>'},
 invite:function(){return '<rect class="w" x="8" y="16" width="48" height="34" rx="4"/><path d="M8 20l24 18 24-18"/><circle class="r" cx="32" cy="38" r="4"/>'},
 check:function(){return '<circle class="a" cx="32" cy="32" r="22"/><path d="M21 33l8 8 15-17"/>'},
 smile:function(){return '<circle class="y" cx="32" cy="32" r="22"/><circle class="k" cx="24" cy="27" r="2.5"/><circle class="k" cx="40" cy="27" r="2.5"/><path d="M21 38c6 8 16 8 22 0"/>'},
 question:function(){return '<circle class="b" cx="32" cy="32" r="22"/><path d="M25 26c0-9 14-9 14 0 0 6-7 6-7 12"/><circle class="k" cx="32" cy="45" r="2.5"/>'},
 zhong:function(){return '<rect class="a" x="8" y="12" width="48" height="40" rx="6"/><text x="32" y="40" text-anchor="middle" class="k" style="font:700 22px var(--font-han)">中文</text>'},
 bell:function(){return '<path class="y" d="M32 10c-10 0-16 8-16 18v8l-4 6h40l-4-6v-8c0-10-6-18-16-18z"/><path d="M27 48a5 5 0 0 0 10 0"/>'},
 clip:function(){return '<rect class="w" x="14" y="12" width="36" height="44" rx="4"/><rect class="b" x="24" y="8" width="16" height="8" rx="2"/><path d="M22 28l3 3 6-7M22 42l3 3 6-7M36 29h8M36 43h8"/>'},
 none:function(){return '<circle class="b" cx="32" cy="32" r="22"/><path d="M16 48L48 16"/>'},
 arrow:function(){return '<circle class="b" cx="32" cy="32" r="22"/><path d="M18 32h26M35 22l10 10-10 10"/>'}
};
var WORDPIC={'今天':['tl',2],'月':['cal'],'日':['calnum','日',1],'星期':['week'],'号':['calnum','28'],'前天':['tl',0],'昨天':['tl',1],'明天':['tl',3],'后天':['tl',4],'生日':['cake'],'礼物':['gift'],'书':['book'],'笔':['pen'],'饭':['bowl'],'吃':['bowl'],'报纸':['news'],'杂志':['mag'],'衣服':['shirt'],'时间':['clock'],'请':['invite'],'对':['check'],'快乐':['smile'],'问题':['question'],'中文':['zhong'],'下课':['bell'],'准备':['clip'],'没有':['none'],'以后':['arrow']};
var PICQ=['生日','礼物','书','笔','饭','报纸','杂志','衣服','时间','请','快乐','问题','中文','下课','准备','星期','对','没有'];
function ico(k,a,b){return '<svg class="il" viewBox="0 0 64 64" aria-hidden="true">'+ICON[k](a,b)+'</svg>'}
function picHtml(zh,cls){var p=WORDPIC[zh];return p?'<span class="pic '+(cls||'')+'">'+ico(p[0],p[1],p[2])+'</span>':''}
function scene(items){return '<div class="scene" aria-hidden="true">'+items.map(function(it){return '<figure><div class="sci">'+ico(it[0],it[1],it[2])+'</div><figcaption>'+it[3]+'</figcaption></figure>'}).join('')+'</div>'}
/* ---------- dialogue ---------- */
var SPK={M:{n:'مارتن',a:'马'},L:{n:'لينا',a:'林'},C:{n:'تسوي هاو',a:'崔'},N:{n:'الراوي',a:'文'}};
var PITCH={M:0.9,L:1.2,C:1.0,N:1.0};
function pitchOf(w){return PITCH[w]||1}
var TXT={
 1:{h:'النص 1: القصة',scene:scene([['calnum','28',0,'الثلاثاء 28 سبتمبر'],['cake',0,0,'عيد ميلاد لينا'],['bowl',0,0,'دعوة إلى الطعام']])},
 2:{h:'النص 2: مارتن ولينا',scene:scene([['calnum','28',0,'كم اليوم؟'],['question',0,0,'ما رأيك؟'],['check',0,0,'موافقة']])},
 3:{h:'النص 3: الهدية',scene:scene([['gift',0,0,'هدية'],['book',0,0,'كتاب صيني'],['pen',0,0,'قلم'],['calnum','10',0,'الأحد 10 أكتوبر']])}
};
var DLG=[
 {text:1,who:'N',zh:'今天九月二十八日，星期二，是林娜的生日。',ar:'اليوم 28 سبتمبر، الثلاثاء، وهو عيد ميلاد لينا.',
  tok:[['今天','jīn tiān','اليوم'],['九月','jiǔ yuè','سبتمبر'],['二十八','èr shí bā','28'],['日','rì','يوم (في التاريخ)'],['，'],['星期二','xīng qī èr','الثلاثاء'],['，'],['是','shì','يكون'],['林娜','Lín nà','لينا (اسم)'],['的','de','أداة الإضافة'],['生日','shēng rì','عيد الميلاد'],['。']]},
 {text:1,who:'N',zh:'下课以后，同学们准备一起请她吃饭。',ar:'بعد انتهاء الحصة ينوي الزملاء أن يدعوها معاً إلى الطعام.',
  tok:[['下课','xià kè','تنتهي الحصة'],['以后','yǐ hòu','بعد'],['，'],['同学们','tóng xué men','الزملاء'],['准备','zhǔn bèi','يخططون'],['一起','yì qǐ','معاً'],['请','qǐng','يدعو'],['她','tā','هي'],['吃饭','chī fàn','يتناول الطعام'],['。']]},
 {text:2,who:'M',zh:'林娜，今天是你的生日，对吗？',ar:'لينا، اليوم عيد ميلادك، صحيح؟',
  tok:[['林娜','Lín nà','لينا (اسم)'],['，'],['今天','jīn tiān','اليوم'],['是','shì','يكون'],['你','nǐ','أنت'],['的','de','أداة الإضافة'],['生日','shēng rì','عيد الميلاد'],['，'],['对','duì','صحيح'],['吗','ma','أداة سؤال'],['？']]},
 {text:2,who:'L',zh:'我的生日？今天几号？',ar:'عيد ميلادي؟ كم اليوم من الشهر؟',
  tok:[['我','wǒ','أنا'],['的','de','أداة الإضافة'],['生日','shēng rì','عيد الميلاد'],['？'],['今天','jīn tiān','اليوم'],['几','jǐ','كم'],['号','hào','رقم اليوم'],['？']]},
 {text:2,who:'M',zh:'今天九月二十八号。',ar:'اليوم 28 سبتمبر.',
  tok:[['今天','jīn tiān','اليوم'],['九月','jiǔ yuè','سبتمبر'],['二十八','èr shí bā','28'],['号','hào','رقم اليوم'],['。']]},
 {text:2,who:'L',zh:'对，对，今天是我的生日。',ar:'صحيح، صحيح، اليوم عيد ميلادي.',
  tok:[['对','duì','صحيح'],['，'],['对','duì','صحيح'],['，'],['今天','jīn tiān','اليوم'],['是','shì','يكون'],['我','wǒ','أنا'],['的','de','أداة الإضافة'],['生日','shēng rì','عيد الميلاد'],['。']]},
 {text:2,who:'M',zh:'我们请你吃饭，怎么样？',ar:'ندعوك إلى الطعام، ما رأيك؟',
  tok:[['我们','wǒ men','نحن'],['请','qǐng','يدعو'],['你','nǐ','أنت'],['吃饭','chī fàn','يتناول الطعام'],['，'],['怎么样','zěn me yàng','ما رأيك؟'],['？']]},
 {text:2,who:'L',zh:'太好了！谢谢你们！',ar:'رائع! شكراً لكم!',
  tok:[['太','tài','جداً'],['好','hǎo','جيد'],['了','le','أداة'],['！'],['谢谢','xiè xie','شكراً'],['你们','nǐ men','أنتم'],['！']]},
 {text:3,who:'M',zh:'林娜，祝你生日快乐！这是我们的礼物。',ar:'لينا، عيد ميلاد سعيد! هذه هديتنا.',
  tok:[['林娜','Lín nà','لينا (اسم)'],['，'],['祝','zhù','يتمنى'],['你','nǐ','أنت'],['生日','shēng rì','عيد الميلاد'],['快乐','kuài lè','سعيد'],['！'],['这','zhè','هذا'],['是','shì','يكون'],['我们','wǒ men','نحن'],['的','de','أداة الإضافة'],['礼物','lǐ wù','هدية'],['。']]},
 {text:3,who:'L',zh:'谢谢。是什么礼物？',ar:'شكراً. ما هذه الهدية؟',
  tok:[['谢谢','xiè xie','شكراً'],['。'],['是','shì','يكون'],['什么','shén me','ماذا'],['礼物','lǐ wù','هدية'],['？']]},
 {text:3,who:'M',zh:'一本中文书和一支笔。',ar:'كتاب صيني وقلم.',
  tok:[['一','yì','واحد'],['本','běn','وحدة عدّ للكتب'],['中文','Zhōng wén','اللغة الصينية'],['书','shū','كتاب'],['和','hé','و'],['一','yì','واحد'],['支','zhī','وحدة عدّ للأقلام'],['笔','bǐ','قلم'],['。']]},
 {text:3,who:'C',zh:'十月十号是我的生日，你们都去我家，怎么样？',ar:'10 أكتوبر هو عيد ميلادي، تذهبون جميعاً إلى بيتي، ما رأيك؟',
  tok:[['十月','shí yuè','أكتوبر'],['十','shí','عشرة'],['号','hào','رقم اليوم'],['是','shì','يكون'],['我','wǒ','أنا'],['的','de','أداة الإضافة'],['生日','shēng rì','عيد الميلاد'],['，'],['你们','nǐ men','أنتم'],['都','dōu','جميعاً'],['去','qù','يذهب'],['我','wǒ','أنا'],['家','jiā','بيت'],['，'],['怎么样','zěn me yàng','ما رأيك؟'],['？']]},
 {text:3,who:'M',zh:'好啊！十月十号星期几？',ar:'موافق! أي يوم من الأسبوع هو 10 أكتوبر؟',
  tok:[['好','hǎo','جيد'],['啊','a','أداة موافقة'],['！'],['十月','shí yuè','أكتوبر'],['十','shí','عشرة'],['号','hào','رقم اليوم'],['星期','xīng qī','يوم الأسبوع'],['几','jǐ','أي / كم'],['？']]},
 {text:3,who:'C',zh:'星期日。',ar:'الأحد.',
  tok:[['星期日','xīng qī rì','الأحد'],['。']]},
 {text:3,who:'L',zh:'有时间，没问题。',ar:'عندي وقت، لا مشكلة.',
  tok:[['有','yǒu','يوجد / عندي'],['时间','shí jiān','وقت'],['，'],['没问题','méi wèn tí','لا مشكلة'],['。']]}
];
var CQ={
 1:[
  {q:{zh:'今天是几月几号？',py:'Jīntiān shì jǐ yuè jǐ hào?'},o:[{zh:'九月二十八号',py:'jiǔ yuè èrshíbā hào'},{zh:'十月十号',py:'shí yuè shí hào'},{zh:'九月十八号',py:'jiǔ yuè shíbā hào'}],a:0},
  {q:{zh:'今天是谁的生日？',py:'Jīntiān shì shéi de shēngrì?'},o:[{zh:'林娜',py:'Lín nà'},{zh:'马丁',py:'Mǎdīng'},{zh:'崔浩',py:'Cuī Hào'}],a:0},
  {q:{zh:'下课以后，同学们准备做什么？',py:'Xià kè yǐhòu, tóngxuémen zhǔnbèi zuò shénme?'},o:[{zh:'请她吃饭',py:'qǐng tā chī fàn'},{zh:'去图书馆',py:'qù túshūguǎn'},{zh:'去银行',py:'qù yínháng'}],a:0}
 ],
 2:[
  {q:{zh:'今天星期几？',py:'Jīntiān xīngqī jǐ?'},o:[{zh:'星期二',py:'xīngqī èr'},{zh:'星期日',py:'xīngqī rì'},{zh:'星期五',py:'xīngqī wǔ'}],a:0},
  {q:{zh:'他们请林娜做什么？',py:'Tāmen qǐng Lín nà zuò shénme?'},o:[{zh:'吃饭',py:'chī fàn'},{zh:'看书',py:'kàn shū'},{zh:'买衣服',py:'mǎi yīfu'}],a:0}
 ],
 3:[
  {q:{zh:'他们送林娜什么礼物？',py:'Tāmen sòng Lín nà shénme lǐwù?'},o:[{zh:'一本中文书和一支笔',py:'yì běn Zhōngwén shū hé yì zhī bǐ'},{zh:'一份报纸和一本杂志',py:'yí fèn bàozhǐ hé yì běn zázhì'},{zh:'一件衣服',py:'yí jiàn yīfu'}],a:0},
  {q:{zh:'崔浩的生日是几月几号？',py:'Cuī Hào de shēngrì shì jǐ yuè jǐ hào?'},o:[{zh:'十月十号',py:'shí yuè shí hào'},{zh:'九月二十八号',py:'jiǔ yuè èrshíbā hào'},{zh:'十月二十号',py:'shí yuè èrshí hào'}],a:0},
  {q:{zh:'十月十号星期几？',py:'Shí yuè shí hào xīngqī jǐ?'},o:[{zh:'星期日',py:'xīngqī rì'},{zh:'星期一',py:'xīngqī yī'},{zh:'星期六',py:'xīngqī liù'}],a:0}
 ]
};
var CLASSX=[
 {zh:'你昨天怎么没来上课？',py:'Nǐ zuótiān zěnme méi lái shàng kè?',ar:'لماذا لم تحضر الحصة أمس؟'},
 {zh:'我期中考试没考好。',py:'Wǒ qīzhōng kǎoshì méi kǎohǎo.',ar:'لم أُحسن في اختبار منتصف الفصل.'}
];
/* ---------- exercises ---------- */
var SENT=[
 {tokens:['今天','是','妈妈的','生日'],zh:'今天是妈妈的生日。',py:'Jīntiān shì māma de shēngrì.',ar:'اليوم عيد ميلاد أمي.'},
 {tokens:['你','准备','买','什么礼物'],zh:'你准备买什么礼物？',py:'Nǐ zhǔnbèi mǎi shénme lǐwù?',ar:'أي هدية تنوي أن تشتري؟'},
 {tokens:['下课以后','我们','一起','吃饭','吧'],zh:'下课以后我们一起吃饭吧。',py:'Xià kè yǐhòu wǒmen yìqǐ chī fàn ba.',ar:'بعد انتهاء الحصة لنأكل معاً.'},
 {tokens:['今天','九月','二日'],zh:'今天九月二日。',py:'Jīntiān jiǔ yuè èr rì.',ar:'اليوم 2 سبتمبر.'},
 {tokens:['你','有','时间','吗'],zh:'你有时间吗？',py:'Nǐ yǒu shíjiān ma?',ar:'هل عندك وقت؟'},
 {tokens:['这','是','谁','的','书'],zh:'这是谁的书？',py:'Zhè shì shéi de shū?',ar:'لمن هذا الكتاب؟'},
 {tokens:['我们','请','你','吃饭','怎么样'],zh:'我们请你吃饭，怎么样？',py:'Wǒmen qǐng nǐ chī fàn, zěnmeyàng?',ar:'ندعوك إلى الطعام، ما رأيك؟'}
];
var FILL=[
 {pre:'今天是林娜的',post:'。',ans:'生日',opts:['生日','礼物','时间'],ar:'اليوم عيد ميلاد لينا.',py:'Jīntiān shì Línnà de shēngrì.'},
 {pre:'祝你生日',post:'！',ans:'快乐',opts:['快乐','没问题','怎么样'],ar:'عيد ميلاد سعيد!',py:'Zhù nǐ shēngrì kuàilè!'},
 {pre:'我有一',post:'笔。',ans:'支',opts:['支','本','个'],ar:'عندي قلم.',py:'Wǒ yǒu yì zhī bǐ.'},
 {pre:'这是一',post:'中文书。',ans:'本',opts:['本','支','口'],ar:'هذا كتاب صيني.',py:'Zhè shì yì běn Zhōngwén shū.'},
 {pre:'今天星期二，',post:'吗？',ans:'对',opts:['对','好','请'],ar:'اليوم الثلاثاء، صحيح؟',py:"Jīntiān xīngqī'èr, duì ma?"},
 {pre:'我们一起去，',post:'？',ans:'怎么样',opts:['怎么样','什么','几号'],ar:'نذهب معاً، ما رأيك؟',py:'Wǒmen yìqǐ qù, zěnmeyàng?'},
 {pre:'这是',post:'的书？',ans:'谁',opts:['谁','什么','几'],ar:'لمن هذا الكتاب؟',py:'Zhè shì shéi de shū?'},
 {pre:'今天',post:'号？',ans:'几',opts:['几','什么','谁'],ar:'كم اليوم من الشهر؟',py:'Jīntiān jǐ hào?'}
];
var CHARS=[
 {c:'又',py:'yòu',ar:'مرة أخرى',n:2},{c:'运',py:'yùn',ar:'ينقل / يتحرك',n:7},{c:'这',py:'zhè',ar:'هذا',n:7},{c:'道',py:'dào',ar:'طريق',n:12},
 {c:'边',py:'biān',ar:'جانب',n:5},{c:'专',py:'zhuān',ar:'خاص / متخصص',n:4},{c:'医',py:'yī',ar:'طب',n:7},{c:'日',py:'rì',ar:'يوم / شمس',n:4},
 {c:'月',py:'yuè',ar:'شهر / قمر',n:4},{c:'号',py:'hào',ar:'رقم',n:5},{c:'书',py:'shū',ar:'كتاب',n:4},{c:'笔',py:'bǐ',ar:'قلم',n:10}
];
var BADGES={
 first:{g:'初',n:'أول اختبار'},perfect:{g:'满',n:'علامة كاملة'},listener:{g:'听',n:'المستمع'},scholar:{g:'词',n:'حافظ المفردات'},master:{g:'优',n:'اختبار شامل'}
};
var ACTS=['match','listen','meaning','pic','tone','order','fill','date'];
