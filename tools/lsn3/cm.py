from core2 import T
WX='王小云｜وانغ شياويون';LN='林娜｜لين نا';DL='丁力波｜دينغ ليبو';MD='马大为｜ما داوي';ZJ='张教授｜الأستاذ تشانغ';YL='杨老师｜المعلم يانغ';SH='师傅｜البائع';SHH='宋华｜سونغ هوا'
CRS={'prac':'القراءة ١','lis':'الاستماع ١'}
def base(n,course,big,zh,ar,intro,**kw):
    d={'n':n,'course':course,'cname':CRS[course],'big':big,'title_zh':zh,'title_ar':ar,'intro_ar':intro,'defpy':1,'minc':12,'tword':'كلمة'}
    d.update(kw);return d
DISC_TABS=[['read','الدرس'],['terms','المفردات'],['prac','التمارين'],['disc','تحدّث']]
def ab(a,b,w=0,q='استمع ثم اختر: أيّ الجملتين سمعت؟'):
    o=[a,b];return {'t':'listen','q':q,'say':o[w],'o':o,'a':w,'why':'الجملة المسموعة: '+o[w]}
def qa(say,o,a,q='استمع للسؤال ثم اختر الجواب المناسب',why=None):
    return {'t':'listen','q':q,'say':say,'o':o,'a':a,'why':why or 'السؤال: '+say}
