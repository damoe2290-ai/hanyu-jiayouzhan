/* ---------- content ---------- */
var VOCAB=[{"zh": "教学楼", "py": "jiào xué lóu", "ar": "مبنى الدراسة", "ex": ["我们在教学楼。", "Wǒmen zài jiàoxuélóu.", "نحن في مبنى الدراسة."]}, {"zh": "教学", "py": "jiào xué", "ar": "تدريس / يُدرّس", "ex": ["他教学。", "Tā jiàoxué.", "هو يدرّس."]}, {"zh": "楼", "py": "lóu", "ar": "مبنى متعدد الطوابق", "ex": ["这是一座楼。", "Zhè shì yí zuò lóu.", "هذا مبنى."]}, {"zh": "在", "py": "zài", "ar": "يقع في / موجود في", "ex": ["图书馆在这儿。", "Túshūguǎn zài zhèr.", "المكتبة هنا."], "note": "تأتي بعد المبتدأ وقبل المكان: 图书馆在这儿."}, {"zh": "这儿", "py": "zhèr", "ar": "هنا", "ex": ["我在这儿。", "Wǒ zài zhèr.", "أنا هنا."], "note": "الحرف 儿 يندمج مع المقطع قبله: zhèr."}, {"zh": "图书馆", "py": "tú shū guǎn", "ar": "مكتبة (الجامعة)", "ex": ["图书馆在哪儿？", "Túshūguǎn zài nǎr?", "أين المكتبة؟"]}, {"zh": "……边", "py": "biān", "ar": "جهة / جانب (لاحقة)", "ex": ["东边", "dōngbian", "الشرق"], "note": "تُضاف إلى كلمات الاتجاه: 东边 北边 前边."}, {"zh": "北边", "py": "běi bian", "ar": "الشمال", "ex": ["图书馆在北边。", "Túshūguǎn zài běibian.", "المكتبة في الشمال."]}, {"zh": "西边", "py": "xī bian", "ar": "الغرب", "ex": ["体育馆在西边。", "Tǐyùguǎn zài xībian.", "الصالة الرياضية في الغرب."]}, {"zh": "南边", "py": "nán bian", "ar": "الجنوب", "ex": ["超市在南边。", "Chāoshì zài nánbian.", "السوبرماركت في الجنوب."]}, {"zh": "运动场", "py": "yùn dòng chǎng", "ar": "ملعب", "ex": ["运动场在这儿。", "Yùndòngchǎng zài zhèr.", "الملعب هنا."]}, {"zh": "体育馆", "py": "tǐ yù guǎn", "ar": "صالة رياضية", "ex": ["体育馆在西边。", "Tǐyùguǎn zài xībian.", "الصالة الرياضية في الغرب."]}, {"zh": "饭馆", "py": "fàn guǎn", "ar": "مطعم", "ex": ["这儿有一个饭馆。", "Zhèr yǒu yí ge fànguǎn.", "هنا يوجد مطعم."]}, {"zh": "还", "py": "hái", "ar": "أيضاً / كذلك", "ex": ["我有书，还有笔。", "Wǒ yǒu shū, hái yǒu bǐ.", "عندي كتاب، وعندي أيضاً قلم."], "note": "تأتي قبل الفعل."}, {"zh": "超市", "py": "chāo shì", "ar": "سوبرماركت", "ex": ["我去超市。", "Wǒ qù chāoshì.", "أنا أذهب إلى السوبرماركت."]}, {"zh": "去", "py": "qù", "ar": "يذهب", "ex": ["你去哪儿？", "Nǐ qù nǎr?", "إلى أين تذهب؟"]}, {"zh": "哪儿", "py": "nǎr", "ar": "أين", "ex": ["银行在哪儿？", "Yínháng zài nǎr?", "أين البنك؟"]}, {"zh": "银行", "py": "yín háng", "ar": "بنك", "ex": ["银行在超市东边。", "Yínháng zài chāoshì dōngbian.", "البنك شرق السوبرماركت."]}, {"zh": "知道", "py": "zhī dào", "ar": "يعرف", "ex": ["我知道，你知道吗？", "Wǒ zhīdào, nǐ zhīdào ma?", "أنا أعرف، هل تعرف؟"]}, {"zh": "东边", "py": "dōng bian", "ar": "الشرق", "ex": ["银行在东边。", "Yínháng zài dōngbian.", "البنك في الشرق."]}, {"zh": "跟", "py": "gēn", "ar": "مع", "ex": ["我跟你去。", "Wǒ gēn nǐ qù.", "أنا أذهب معك."]}, {"zh": "吧", "py": "ba", "ar": "أداة اقتراح (هيا / لنفعل)", "ex": ["我们一起去吧。", "Wǒmen yìqǐ qù ba.", "هيا نذهب معاً."], "note": "تأتي في آخر الجملة للاقتراح أو التشاور."}, {"zh": "太", "py": "tài", "ar": "جداً / للغاية", "ex": ["太好了！", "Tài hǎo le!", "رائع جداً!"], "note": "غالباً مع 了: 太……了."}, {"zh": "了", "py": "le", "ar": "أداة (مع 太)", "ex": ["太好了！", "Tài hǎo le!", "رائع!"]}, {"zh": "卫生间", "py": "wèi shēng jiān", "ar": "دورة المياه", "ex": ["卫生间在哪儿？", "Wèishēngjiān zài nǎr?", "أين دورة المياه؟"]}, {"zh": "对不起", "py": "duì bu qǐ", "ar": "آسف / المعذرة", "ex": ["对不起，我不知道。", "Duìbuqǐ, wǒ bù zhīdào.", "آسف، لا أعرف."]}, {"zh": "没关系", "py": "méi guān xi", "ar": "لا بأس / لا مشكلة", "ex": ["没关系。", "Méi guānxi.", "لا بأس."], "note": "جواب شائع على 对不起."}, {"zh": "商店", "py": "shāng diàn", "ar": "متجر", "ex": ["商店里边有卫生间。", "Shāngdiàn lǐbian yǒu wèishēngjiān.", "داخل المتجر توجد دورة مياه."]}, {"zh": "里边", "py": "lǐ bian", "ar": "الداخل", "ex": ["商店里边有人。", "Shāngdiàn lǐbian yǒu rén.", "داخل المتجر أناس."]}, {"zh": "地方", "py": "dì fang", "ar": "مكان", "ex": ["这是什么地方？", "Zhè shì shénme dìfang?", "ما هذا المكان؟"]}, {"zh": "前边", "py": "qián bian", "ar": "الأمام", "ex": ["卫生间在前边。", "Wèishēngjiān zài qiánbian.", "دورة المياه في الأمام."]}, {"zh": "看", "py": "kàn", "ar": "ينظر / يرى", "ex": ["你看！", "Nǐ kàn!", "انظر!"]}, {"zh": "那儿", "py": "nàr", "ar": "هناك", "ex": ["银行在那儿。", "Yínháng zài nàr.", "البنك هناك."]}, {"zh": "就", "py": "jiù", "ar": "بالضبط / هو نفسه", "ex": ["那儿就是银行。", "Nàr jiù shì yínháng.", "هناك هو البنك بالضبط."]}, {"zh": "中国银行", "py": "Zhōng guó Yín háng", "ar": "بنك الصين (اسم علم)", "ex": ["中国银行在哪儿？", "Zhōngguó Yínháng zài nǎr?", "أين بنك الصين؟"]}, {"zh": "上边", "py": "shàng bian", "ar": "الأعلى / فوق", "ex": ["书在桌子上边。", "Shū zài zhuōzi shàngbian.", "الكتاب فوق الطاولة."], "sup": 1}, {"zh": "下边", "py": "xià bian", "ar": "الأسفل / تحت", "ex": ["笔在书下边。", "Bǐ zài shū xiàbian.", "القلم تحت الكتاب."], "sup": 1}, {"zh": "后边", "py": "hòu bian", "ar": "الخلف", "ex": ["超市在银行后边。", "Chāoshì zài yínháng hòubian.", "السوبرماركت خلف البنك."], "sup": 1}, {"zh": "左边", "py": "zuǒ bian", "ar": "اليسار", "ex": ["饭馆在左边。", "Fànguǎn zài zuǒbian.", "المطعم على اليسار."], "sup": 1}, {"zh": "右边", "py": "yòu bian", "ar": "اليمين", "ex": ["银行在右边。", "Yínháng zài yòubian.", "البنك على اليمين."], "sup": 1}, {"zh": "外边", "py": "wài bian", "ar": "الخارج", "ex": ["他在外边。", "Tā zài wàibian.", "هو في الخارج."], "sup": 1}, {"zh": "旁边", "py": "páng biān", "ar": "بجانب", "ex": ["商店在银行旁边。", "Shāngdiàn zài yínháng pángbiān.", "المتجر بجانب البنك."], "sup": 1}, {"zh": "书店", "py": "shū diàn", "ar": "مكتبة (متجر كتب)", "ex": ["书店在哪儿？", "Shūdiàn zài nǎr?", "أين متجر الكتب؟"], "sup": 1}, {"zh": "邮局", "py": "yóu jú", "ar": "مكتب البريد", "ex": ["邮局在银行旁边。", "Yóujú zài yínháng pángbiān.", "مكتب البريد بجانب البنك."], "sup": 1}, {"zh": "桌子", "py": "zhuō zi", "ar": "طاولة / مكتب", "ex": ["书在桌子上。", "Shū zài zhuōzi shang.", "الكتاب على الطاولة."], "sup": 1}, {"zh": "书包", "py": "shū bāo", "ar": "حقيبة مدرسية", "ex": ["书包在桌子下边。", "Shūbāo zài zhuōzi xiàbian.", "الحقيبة تحت الطاولة."], "sup": 1}, {"zh": "宿舍", "py": "sù shè", "ar": "سكن الطلاب", "ex": ["宿舍在留学生楼北边。", "Sùshè zài liúxuéshēng lóu běibian.", "السكن شمال مبنى الطلاب الدوليين."], "sup": 1}];
var TOKPY={};VOCAB.forEach(function(v){TOKPY[v.zh]=v.py});
var EXTRA={'教学一楼':'jiào xué yī lóu','留学生楼':'liú xué shēng lóu','一个':'yí ge','我':'wǒ','你':'nǐ','他':'tā','她':'tā','们':'men','好':'hǎo','请问':'qǐng wèn','不':'bù','是':'shì','有':'yǒu','和':'hé','什么':'shén me','吗':'ma','哪儿':'nǎr','不客气':'bú kè qi','谢谢':'xiè xie','山田':'Shān tián','阿明':'Ā míng','马丁':'Mǎ dīng','我们':'wǒ men','一起':'yì qǐ','买':'mǎi','书':'shū','笔':'bǐ','学习':'xué xí','汉语':'Hàn yǔ'};
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
ICON.bank=function(){return '<path class="a" d="M8 24L32 10l24 14z"/><rect class="w" x="12" y="26" width="40" height="6"/><path d="M16 32v16M26 32v16M38 32v16M48 32v16"/><rect class="a" x="8" y="48" width="48" height="8" rx="2"/>'};
ICON.shop=function(){return '<path class="r" d="M8 22l4-10h40l4 10z"/><path class="w" d="M12 22v30h40V22"/><rect class="b" x="26" y="34" width="12" height="18"/><path d="M8 22c0 6 8 6 8 0 0 6 8 6 8 0 0 6 8 6 8 0 0 6 8 6 8 0 0 6 8 6 8 0"/>'};
ICON.cart=function(){return '<path d="M6 12h8l6 28h28l6-20H18"/><path class="a" d="M20 22h32l-4 14H24z"/><circle class="k" cx="24" cy="50" r="4"/><circle class="k" cx="44" cy="50" r="4"/>'};
ICON.wc=function(){return '<rect class="b" x="6" y="8" width="52" height="48" rx="6"/><circle class="k" cx="20" cy="20" r="4"/><path d="M20 26v14M14 30h12M17 40v10M23 40v10"/><circle class="k" cx="44" cy="20" r="4"/><path class="k" d="M44 26l-8 16h16z"/><path d="M41 42v8M47 42v8"/>'};
ICON.gym=function(){return '<path d="M12 32h40"/><rect class="r" x="6" y="22" width="8" height="20" rx="2"/><rect class="r" x="50" y="22" width="8" height="20" rx="2"/><rect class="y" x="14" y="26" width="6" height="12"/><rect class="y" x="44" y="26" width="6" height="12"/>'};
ICON.field=function(){return '<ellipse class="a" cx="32" cy="32" rx="26" ry="18"/><ellipse class="w" cx="32" cy="32" rx="16" ry="9"/>'};
ICON.school=function(){return '<rect class="a" x="8" y="22" width="48" height="32" rx="2"/><path class="r" d="M6 22L32 8l26 14z"/><path d="M16 32h8M30 32h8M44 32h6M16 42h8M44 42h6"/><rect class="w" x="28" y="42" width="8" height="12"/>'};
ICON.bag=function(){return '<rect class="y" x="14" y="18" width="36" height="38" rx="6"/><path d="M24 18v-4a8 8 0 0 1 16 0v4"/><rect class="w" x="22" y="34" width="20" height="14" rx="3"/>'};
ICON.desk=function(){return '<rect class="a" x="6" y="22" width="52" height="8" rx="2"/><path d="M12 30v24M52 30v24"/>'};
ICON.dorm=function(){return '<path class="a" d="M8 30L32 10l24 20v24H8z"/><rect class="w" x="16" y="36" width="32" height="10" rx="2"/><path d="M16 46v6M48 46v6"/><circle class="y" cx="24" cy="40" r="2.5"/>'};
ICON.eye=function(){return '<path class="w" d="M6 32c8-14 44-14 52 0-8 14-44 14-52 0z"/><circle class="a" cx="32" cy="32" r="8"/><circle class="k" cx="32" cy="32" r="3"/>'};
ICON.know=function(){return '<circle class="y" cx="32" cy="26" r="14"/><path d="M26 44h12M28 50h8"/>'};
ICON.compass=function(d){function p(i,s){return '<path class="'+(i===d?'r':'w')+'" d="'+s+'"/>'}return '<circle class="b" cx="32" cy="32" r="24"/>'+p(0,'M32 8l8 20H24z')+p(1,'M56 32l-20 8V24z')+p(2,'M32 56l-8-20h16z')+p(3,'M8 32l20-8v16z')};
ICON.map=function(){return '<path class="a" d="M6 14l16-6 20 6 16-6v42l-16 6-20-6-16 6z"/><path d="M22 8v42M42 14v42"/>'};
/* ---------- new illustrations: position and concept words, drawn for this lesson in one style: a red ball and a pink box,
   64x64, the same stroke and palette classes as the icons above (a pink, b grey, r red, y gold, w white, k solid). ---------- */
ICON.up=function(){return '<rect class="a" x="10" y="38" width="40" height="18" rx="3"/><circle class="r" cx="30" cy="25" r="10"/><path d="M56 32V10M50 16l6-6 6 6"/>'};
ICON.down=function(){return '<rect class="a" x="10" y="8" width="40" height="18" rx="3"/><circle class="r" cx="30" cy="42" r="10"/><path d="M56 32v22M50 48l6 6 6-6"/>'};
ICON.inn=function(){return '<rect class="b" x="7" y="12" width="50" height="42" rx="6"/><circle class="r" cx="32" cy="33" r="10"/>'};
ICON.out=function(){return '<rect class="b" x="5" y="12" width="36" height="42" rx="6"/><circle class="r" cx="51" cy="33" r="8"/><path d="M14 33h20M27 26l7 7-7 7"/>'};
ICON.left=function(){return '<rect class="a" x="28" y="20" width="28" height="28" rx="3"/><circle class="r" cx="13" cy="34" r="8"/><path d="M46 57H14M22 51l-8 6 8 6"/>'};
ICON.right=function(){return '<rect class="a" x="8" y="20" width="28" height="28" rx="3"/><circle class="r" cx="51" cy="34" r="8"/><path d="M18 57h32M42 51l8 6-8 6"/>'};
ICON.front=function(){return '<ellipse class="b" cx="32" cy="55" rx="24" ry="5"/><rect class="a" x="14" y="8" width="36" height="28" rx="3"/><circle class="r" cx="32" cy="42" r="12"/>'};
ICON.back=function(){return '<ellipse class="b" cx="32" cy="55" rx="24" ry="5"/><circle class="r" cx="32" cy="22" r="11"/><rect class="a" x="10" y="26" width="44" height="26" rx="3"/>'};
ICON.beside=function(){return '<rect class="a" x="6" y="24" width="26" height="28" rx="3"/><circle class="r" cx="45" cy="40" r="10"/><path d="M6 58h48M6 54v8M54 54v8"/>'};
ICON.here=function(){return '<ellipse class="b" cx="32" cy="55" rx="20" ry="6"/><path class="r" d="M32 52C22 40 17 34 17 25a15 15 0 0 1 30 0c0 9-5 15-15 27z"/><circle class="w" cx="32" cy="25" r="6"/>'};
ICON.there=function(){return '<circle class="w" cx="11" cy="49" r="4"/><path d="M11 53v7M5 56h12"/><path d="M17 44C26 38 34 30 42 24" stroke-dasharray="3 4"/><path class="r" d="M50 28C45 22 42 18 42 14a8 8 0 0 1 16 0c0 4-3 8-8 14z"/><circle class="w" cx="50" cy="14" r="3"/>'};
ICON.know=function(){return '<circle class="a" cx="32" cy="26" r="16"/><path d="M12 58c2-11 10-15 20-15s18 4 20 15"/><path d="M24 26l6 7 11-13" style="stroke:var(--seal);stroke-width:4.5"/>'};
ICON.ok=function(){return '<rect class="b" x="6" y="30" width="12" height="26" rx="2"/><path class="y" d="M22 32l9-17c2-3 8-1 7 4l-2 10h13c4 0 6 3 5 7l-4 17c-1 3-3 4-6 4H22z"/>'};
var WORDPIC={'教学楼':['school'],'楼':['school'],'图书馆':['book'],'运动场':['field'],'体育馆':['gym'],'饭馆':['bowl'],'超市':['cart'],'银行':['bank'],'中国银行':['bank'],'商店':['shop'],'书店':['shop'],'卫生间':['wc'],'邮局':['invite'],'书包':['bag'],'桌子':['desk'],'宿舍':['dorm'],'看':['eye'],'知道':['know'],'去':['arrow'],'哪儿':['question'],'这儿':['here'],'那儿':['there'],'北边':['compass',0],'东边':['compass',1],'南边':['compass',2],'西边':['compass',3],'左边':['left'],'右边':['right'],'前边':['front'],'后边':['back'],'上边':['up'],'下边':['down'],'里边':['inn'],'外边':['out'],'旁边':['beside'],'没关系':['ok'],'地方':['map']};
var PICQ=['教学楼','图书馆','运动场','体育馆','饭馆','超市','银行','商店','卫生间','邮局','书包','桌子','宿舍','看','北边','东边','南边','西边','左边','右边','前边','后边','上边','下边','里边','外边','旁边','这儿','那儿'];
function ico(k,a,b){return '<svg class="il" viewBox="0 0 64 64" aria-hidden="true">'+ICON[k](a,b)+'</svg>'}
function picHtml(zh,cls){var p=WORDPIC[zh];return p?'<span class="pic '+(cls||'')+'">'+ico(p[0],p[1],p[2])+'</span>':''}
/* layout fix at 360px: rows 运动场 and 中国银行 were wider than the screen and pushed the speaker button off it */
(function(){var st=document.createElement('style');st.textContent='#p-vocab .row{grid-template-columns:44px auto minmax(0,1fr) 24px 44px;column-gap:8px}#p-vocab .row .rpy,#p-vocab .row .rar{overflow-wrap:anywhere}';document.head.appendChild(st)})();
function scene(items){return '<div class="scene" aria-hidden="true">'+items.map(function(it){return '<figure><div class="sci">'+ico(it[0],it[1],it[2])+'</div><figcaption>'+it[3]+'</figcaption></figure>'}).join('')+'</div>'}
/* campus map drawn from text 1 (north is up) */
function mapSvg(){
  function tx(x,y,t,fs){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 '+(fs||13)+'px var(--font-han)" fill="var(--fg)">'+t+'</text>'}
  function bx(x,y,w,h,t,fs){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="var(--surface)" stroke="var(--fg)" stroke-width="1.6"/>'+tx(x+w/2,y+h/2+4,t,fs)}
  return '<svg viewBox="0 0 330 250" role="img" aria-label="خريطة الحرم الجامعي" style="width:100%;max-width:420px;display:block;margin:auto">'+
   '<rect x="1" y="1" width="328" height="248" rx="12" fill="var(--accent-soft)" stroke="var(--line)"/>'+
   '<g stroke="var(--fg)" stroke-width="2" fill="none" stroke-linecap="round"><path d="M26 56V22M18 30l8-8 8 8"/></g><text x="26" y="74" text-anchor="middle" style="font:700 14px var(--font-han)" fill="var(--seal)">北</text>'+
   bx(220,18,92,38,'图书馆')+bx(220,84,92,38,'教学一楼')+
   '<rect x="156" y="70" width="46" height="66" rx="5" fill="var(--surface)" stroke="var(--fg)" stroke-width="1.6"/>'+tx(179,95,'体')+tx(179,112,'育')+tx(179,129,'馆')+
   '<ellipse cx="96" cy="103" rx="42" ry="40" fill="var(--surface)" stroke="var(--fg)" stroke-width="1.6"/>'+tx(96,99,'运动')+tx(96,116,'场')+
   bx(60,176,100,38,'留学生楼')+bx(10,176,46,38,'饭馆',12)+bx(10,218,46,26,'超市',12)+
   '</svg>';
}
/* ---------- dialogue ---------- */
var SPK={M:{n:'مارتن',a:'马'},S:{n:'ياماداً',a:'山'},A:{n:'أمينغ',a:'明'},X:{n:'طالب أ',a:'甲'},Y:{n:'طالب ب',a:'乙'},N:{n:'الراوي',a:'文'}};
var PITCH={M:0.9,S:1.0,A:1.05,X:1.2,Y:0.95,N:1.0};
function pitchOf(w){return PITCH[w]||1}
var TXT={
 1:{h:'النص 1: الحرم الجامعي',scene:'<div class="scene" aria-hidden="true" style="display:block">'+mapSvg()+'</div>'},
 2:{h:'النص 2: إلى أين تذهب؟',scene:scene([['question',0,0,'你去哪儿？'],['cart',0,0,'超市'],['bank',0,0,'中国银行'],['arrow',0,0,'一起去']])},
 3:{h:'النص 3: أين دورة المياه؟',scene:scene([['wc',0,0,'卫生间'],['shop',0,0,'商店'],['eye',0,0,'你看！']])}
};
var DLG=[{"text": 1, "who": "N", "zh": "这是教学一楼，我们在这儿。", "ar": "هذا مبنى الدراسة الأول، ونحن هنا.", "tok": [["这", "zhè", "هذا"], ["是", "shì", "يكون"], ["教学一楼", "jiào xué yī lóu", "مبنى الدراسة الأول"], ["，"], ["我们", "wǒ men", "نحن"], ["在", "zài", "في / يقع في"], ["这儿", "zhèr", "هنا"], ["。"]]}, {"text": 1, "who": "N", "zh": "图书馆在教学一楼北边，运动场和体育馆在教学一楼西边。", "ar": "المكتبة شمال مبنى الدراسة الأول، والملعب والصالة الرياضية غربه.", "tok": [["图书馆", "tú shū guǎn", "مكتبة الجامعة"], ["在", "zài", "في / يقع في"], ["教学一楼", "jiào xué yī lóu", "مبنى الدراسة الأول"], ["北边", "běi bian", "شمال"], ["，"], ["运动场", "yùn dòng chǎng", "ملعب"], ["和", "hé", "و"], ["体育馆", "tǐ yù guǎn", "صالة رياضية"], ["在", "zài", "في / يقع في"], ["教学一楼", "jiào xué yī lóu", "مبنى الدراسة الأول"], ["西边", "xī bian", "غرب"], ["。"]]}, {"text": 1, "who": "N", "zh": "这是留学生楼，留学生楼在运动场南边，", "ar": "هذا مبنى الطلاب الدوليين، وهو جنوب الملعب،", "tok": [["这", "zhè", "هذا"], ["是", "shì", "يكون"], ["留学生楼", "liú xué shēng lóu", "مبنى الطلاب الدوليين"], ["，"], ["留学生楼", "liú xué shēng lóu", "مبنى الطلاب الدوليين"], ["在", "zài", "في / يقع في"], ["运动场", "yùn dòng chǎng", "ملعب"], ["南边", "nán bian", "جنوب"], ["，"]]}, {"text": 1, "who": "N", "zh": "留学生楼西边有一个饭馆，还有一个超市。", "ar": "وغرب المبنى يوجد مطعم، ويوجد أيضاً سوبرماركت.", "tok": [["留学生楼", "liú xué shēng lóu", "مبنى الطلاب الدوليين"], ["西边", "xī bian", "غرب"], ["有", "yǒu", "يوجد"], ["一", "yí", "واحد"], ["个", "ge", "وحدة عدّ"], ["饭馆", "fàn guǎn", "مطعم"], ["，"], ["还", "hái", "أيضاً"], ["有", "yǒu", "يوجد"], ["一", "yí", "واحد"], ["个", "ge", "وحدة عدّ"], ["超市", "chāo shì", "سوبرماركت"], ["。"]]}, {"text": 2, "who": "M", "zh": "山田，你去哪儿？", "ar": "يامادا، إلى أين تذهب؟", "tok": [["山田", "Shān tián", "ياماداً (اسم)"], ["，"], ["你", "nǐ", "أنت"], ["去", "qù", "يذهب"], ["哪儿", "nǎr", "أين"], ["？"]]}, {"text": 2, "who": "S", "zh": "我去超市。", "ar": "أنا ذاهب إلى السوبرماركت.", "tok": [["我", "wǒ", "أنا"], ["去", "qù", "يذهب"], ["超市", "chāo shì", "سوبرماركت"], ["。"]]}, {"text": 2, "who": "M", "zh": "中国银行在哪儿？你知道吗？", "ar": "أين بنك الصين؟ هل تعرف؟", "tok": [["中国银行", "Zhōng guó Yín háng", "بنك الصين"], ["在", "zài", "في / يقع في"], ["哪儿", "nǎr", "أين"], ["？"], ["你", "nǐ", "أنت"], ["知道", "zhī dào", "يعرف"], ["吗", "ma", "أداة سؤال"], ["？"]]}, {"text": 2, "who": "S", "zh": "知道，在超市东边。我跟你一起去吧。", "ar": "أعرف، إنه شرق السوبرماركت. سأذهب معك.", "tok": [["知道", "zhī dào", "يعرف"], ["，"], ["在", "zài", "في / يقع في"], ["超市", "chāo shì", "سوبرماركت"], ["东边", "dōng bian", "شرق"], ["。"], ["我", "wǒ", "أنا"], ["跟", "gēn", "مع"], ["你", "nǐ", "أنت"], ["一起", "yì qǐ", "معاً"], ["去", "qù", "يذهب"], ["吧", "ba", "أداة اقتراح"], ["。"]]}, {"text": 2, "who": "M", "zh": "太好了！", "ar": "رائع!", "tok": [["太", "tài", "جداً"], ["好", "hǎo", "جيد"], ["了", "le", "أداة"], ["！"]]}, {"text": 3, "who": "N", "zh": "阿明在路上找卫生间。", "ar": "أمينغ يبحث عن دورة المياه في الطريق.", "tok": [["阿明", "Ā míng", "أمينغ (اسم)"], ["在", "zài", "في / يقع في"], ["路上", "lù shang", "على الطريق"], ["找", "zhǎo", "يبحث عن"], ["卫生间", "wèi shēng jiān", "دورة المياه"], ["。"]]}, {"text": 3, "who": "A", "zh": "请问，哪儿有卫生间？", "ar": "لو سمحت، أين توجد دورة مياه؟", "tok": [["请问", "qǐng wèn", "لو سمحت"], ["，"], ["哪儿", "nǎr", "أين"], ["有", "yǒu", "يوجد"], ["卫生间", "wèi shēng jiān", "دورة المياه"], ["？"]]}, {"text": 3, "who": "X", "zh": "对不起，我不知道。", "ar": "آسف، لا أعرف.", "tok": [["对不起", "duì bu qǐ", "آسف"], ["，"], ["我", "wǒ", "أنا"], ["不", "bù", "لا"], ["知道", "zhī dào", "يعرف"], ["。"]]}, {"text": 3, "who": "A", "zh": "没关系。请问，你知道哪儿有卫生间吗？", "ar": "لا بأس. لو سمحت، هل تعرف أين توجد دورة مياه؟", "tok": [["没关系", "méi guān xi", "لا بأس"], ["。"], ["请问", "qǐng wèn", "لو سمحت"], ["，"], ["你", "nǐ", "أنت"], ["知道", "zhī dào", "يعرف"], ["哪儿", "nǎr", "أين"], ["有", "yǒu", "يوجد"], ["卫生间", "wèi shēng jiān", "دورة المياه"], ["吗", "ma", "أداة سؤال"], ["？"]]}, {"text": 3, "who": "Y", "zh": "商店里边有。", "ar": "داخل المتجر توجد.", "tok": [["商店", "shāng diàn", "متجر"], ["里边", "lǐ bian", "داخل"], ["有", "yǒu", "يوجد"], ["。"]]}, {"text": 3, "who": "A", "zh": "商店在什么地方？", "ar": "أين المتجر؟", "tok": [["商店", "shāng diàn", "متجر"], ["在", "zài", "في / يقع في"], ["什么", "shén me", "أي / ماذا"], ["地方", "dì fang", "مكان"], ["？"]]}, {"text": 3, "who": "Y", "zh": "在前边。你看，那儿就是。", "ar": "في الأمام. انظر، هناك بالضبط.", "tok": [["在", "zài", "في / يقع في"], ["前边", "qián bian", "أمام"], ["。"], ["你", "nǐ", "أنت"], ["看", "kàn", "ينظر"], ["，"], ["那儿", "nàr", "هناك"], ["就", "jiù", "بالضبط"], ["是", "shì", "يكون"], ["。"]]}, {"text": 3, "who": "A", "zh": "谢谢！", "ar": "شكراً!", "tok": [["谢谢", "xiè xie", "شكراً"], ["！"]]}, {"text": 3, "who": "Y", "zh": "不客气。", "ar": "عفواً.", "tok": [["不客气", "bú kè qi", "عفواً"], ["。"]]}];
/* end-of-text questions: in Chinese, with pinyin */
function Q(zh,py){return {zh:zh,py:py}}
var CQ={
 1:[
  {q:Q('图书馆在哪儿？','Túshūguǎn zài nǎr?'),o:[Q('教学一楼北边','jiàoxué yī lóu běibian'),Q('教学一楼西边','jiàoxué yī lóu xībian'),Q('运动场南边','yùndòngchǎng nánbian')],a:0},
  {q:Q('体育馆在哪儿？','Tǐyùguǎn zài nǎr?'),o:[Q('教学一楼北边','jiàoxué yī lóu běibian'),Q('教学一楼西边','jiàoxué yī lóu xībian'),Q('超市东边','chāoshì dōngbian')],a:1},
  {q:Q('留学生楼在哪儿？','Liúxuéshēng lóu zài nǎr?'),o:[Q('图书馆北边','túshūguǎn běibian'),Q('饭馆西边','fànguǎn xībian'),Q('运动场南边','yùndòngchǎng nánbian')],a:2},
  {q:Q('留学生楼西边有什么？','Liúxuéshēng lóu xībian yǒu shénme?'),o:[Q('一个饭馆，一个超市','yí ge fànguǎn, yí ge chāoshì'),Q('一个体育馆','yí ge tǐyùguǎn'),Q('一个图书馆','yí ge túshūguǎn')],a:0}
 ],
 2:[
  {q:Q('山田去哪儿？','Shāntián qù nǎr?'),o:[Q('超市','chāoshì'),Q('图书馆','túshūguǎn'),Q('体育馆','tǐyùguǎn')],a:0},
  {q:Q('中国银行在哪儿？','Zhōngguó Yínháng zài nǎr?'),o:[Q('超市西边','chāoshì xībian'),Q('超市东边','chāoshì dōngbian'),Q('运动场南边','yùndòngchǎng nánbian')],a:1},
  {q:Q('马丁去哪儿？','Mǎdīng qù nǎr?'),o:[Q('饭馆','fànguǎn'),Q('图书馆','túshūguǎn'),Q('中国银行','Zhōngguó Yínháng')],a:2}
 ],
 3:[
  {q:Q('哪儿有卫生间？','Nǎr yǒu wèishēngjiān?'),o:[Q('商店里边','shāngdiàn lǐbian'),Q('图书馆里边','túshūguǎn lǐbian'),Q('超市外边','chāoshì wàibian')],a:0},
  {q:Q('商店在什么地方？','Shāngdiàn zài shénme dìfang?'),o:[Q('前边','qiánbian'),Q('后边','hòubian'),Q('左边','zuǒbian')],a:0},
  {q:Q('学生A知道吗？','Xuésheng A zhīdào ma?'),o:[Q('知道','zhīdào'),Q('不知道','bù zhīdào'),Q('不客气','bú kèqi')],a:1}
 ]
};
var CLASSX=[
 {zh:'周一交作业。',py:'Zhōuyī jiāo zuòyè.',ar:'سلّموا الواجب يوم الاثنين.'},
 {zh:'做课后练习三。',py:'Zuò kè hòu liànxí sān.',ar:'حلّوا التمرين الثالث بعد النصوص.'}
];
/* ---------- exercises ---------- */
var SENT=[
 {tokens:['图书馆','在','教学一楼','北边'],zh:'图书馆在教学一楼北边。',py:'Túshūguǎn zài jiàoxué yī lóu běibian.',ar:'المكتبة شمال مبنى الدراسة الأول.'},
 {tokens:['留学生楼','西边','有','一个','饭馆'],zh:'留学生楼西边有一个饭馆。',py:'Liúxuéshēng lóu xībian yǒu yí ge fànguǎn.',ar:'غرب مبنى الطلاب الدوليين مطعم.'},
 {tokens:['中国银行','在','超市','东边'],zh:'中国银行在超市东边。',py:'Zhōngguó Yínháng zài chāoshì dōngbian.',ar:'بنك الصين شرق السوبرماركت.'},
 {tokens:['我','跟','你','一起','去','吧'],zh:'我跟你一起去吧。',py:'Wǒ gēn nǐ yìqǐ qù ba.',ar:'سأذهب معك.'},
 {tokens:['请问','哪儿','有','卫生间'],zh:'请问，哪儿有卫生间？',py:'Qǐngwèn, nǎr yǒu wèishēngjiān?',ar:'لو سمحت، أين توجد دورة مياه؟'},
 {tokens:['商店','里边','有','卫生间'],zh:'商店里边有卫生间。',py:'Shāngdiàn lǐbian yǒu wèishēngjiān.',ar:'داخل المتجر دورة مياه.'},
 {tokens:['你','知道','哪儿','有','超市','吗'],zh:'你知道哪儿有超市吗？',py:'Nǐ zhīdào nǎr yǒu chāoshì ma?',ar:'هل تعرف أين يوجد سوبرماركت؟'}
];
var FILL=[
 {pre:'图书馆',post:'教学一楼北边。',ans:'在',opts:['在','有','去'],ar:'المكتبة شمال مبنى الدراسة الأول.',py:'Túshūguǎn zài jiàoxué yī lóu běibian.'},
 {pre:'留学生楼西边',post:'一个饭馆。',ans:'有',opts:['有','在','是'],ar:'غرب المبنى يوجد مطعم.',py:'Liúxuéshēng lóu xībian yǒu yí ge fànguǎn.'},
 {pre:'中国银行在超市',post:'。',ans:'东边',opts:['东边','哪儿','吗'],ar:'بنك الصين شرق السوبرماركت.',py:'Zhōngguó Yínháng zài chāoshì dōngbian.'},
 {pre:'银行在',post:'？',ans:'哪儿',opts:['哪儿','什么','几'],ar:'أين البنك؟',py:'Yínháng zài nǎr?'},
 {pre:'我跟你一起去',post:'。',ans:'吧',opts:['吧','吗','了'],ar:'سأذهب معك.',py:'Wǒ gēn nǐ yìqǐ qù ba.'},
 {pre:'这儿有一个超市，东边',post:'有一个超市。',ans:'还',opts:['还','太','就'],ar:'هنا سوبرماركت، وفي الشرق أيضاً سوبرماركت.',py:'Zhèr yǒu yí ge chāoshì, dōngbian hái yǒu yí ge chāoshì.'},
 {pre:'',post:'，我不知道。',ans:'对不起',opts:['对不起','没关系','不客气'],ar:'آسف، لا أعرف.',py:'Duìbuqǐ, wǒ bù zhīdào.'},
 {pre:'谢谢！——不',post:'。',ans:'客气',opts:['客气','关系','知道'],ar:'شكراً! — عفواً.',py:'Xièxie! — Bú kèqi.'}
];
var OPTS=[
 ['教学一楼北边','jiàoxué yī lóu běibian'],['教学一楼西边','jiàoxué yī lóu xībian'],['教学一楼东边','jiàoxué yī lóu dōngbian'],['教学一楼南边','jiàoxué yī lóu nánbian'],
 ['运动场南边','yùndòngchǎng nánbian'],['运动场北边','yùndòngchǎng běibian'],['体育馆西边','tǐyùguǎn xībian'],['体育馆东边','tǐyùguǎn dōngbian'],
 ['留学生楼西边','liúxuéshēng lóu xībian'],['留学生楼东边','liúxuéshēng lóu dōngbian'],['图书馆南边','túshūguǎn nánbian'],['图书馆北边','túshūguǎn běibian']
];
var MAPQ=[
 {q:'图书馆在哪儿？',py:'Túshūguǎn zài nǎr?',a:'教学一楼北边'},
 {q:'体育馆在哪儿？',py:'Tǐyùguǎn zài nǎr?',a:'教学一楼西边'},
 {q:'留学生楼在哪儿？',py:'Liúxuéshēng lóu zài nǎr?',a:'运动场南边'},
 {q:'运动场在哪儿？',py:'Yùndòngchǎng zài nǎr?',a:'体育馆西边'},
 {q:'教学一楼在哪儿？',py:'Jiàoxué yī lóu zài nǎr?',a:'图书馆南边'},
 {q:'饭馆在哪儿？',py:'Fànguǎn zài nǎr?',a:'留学生楼西边'}
];
var CHARS=[
 {c:'四',py:'sì',ar:'أربعة',n:5},{c:'没',py:'méi',ar:'لا / لم',n:7},{c:'银',py:'yín',ar:'فضة',n:11},{c:'饭',py:'fàn',ar:'طعام / أرز',n:7},
 {c:'谢',py:'xiè',ar:'يشكر',n:12},{c:'谁',py:'shéi',ar:'مَن',n:10},{c:'东',py:'dōng',ar:'شرق',n:5},{c:'西',py:'xī',ar:'غرب',n:6},
 {c:'南',py:'nán',ar:'جنوب',n:9},{c:'北',py:'běi',ar:'شمال',n:5}
];
var BADGES={
 first:{g:'初',n:'أول اختبار'},perfect:{g:'满',n:'علامة كاملة'},listener:{g:'听',n:'المستمع'},scholar:{g:'词',n:'حافظ المفردات'},master:{g:'优',n:'اختبار شامل'}
};
var ACTS=['match','listen','meaning','pic','tone','order','fill','where'];
