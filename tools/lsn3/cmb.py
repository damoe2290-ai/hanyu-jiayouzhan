from core2 import T
WZD='王志东｜وانغ تشي دونغ';SMS='史密斯｜سميث';ZL='张丽｜تشانغ لي';LML='李明亮｜لي مينغ ليانغ';MGR='经理｜المدير';SHY='售货员｜البائع';GK='顾客｜الزبون';SYY='收银员｜أمين الصندوق';TST='祝酒人｜صاحب الكلمة'
def base(n,big,zh,ar,intro,**kw):
    d={'n':n,'course':'biz','cname':'اللغة الصينية العملية','big':big,'title_zh':zh,'title_ar':ar,'intro_ar':intro,'defpy':1,'minc':20,'tword':'كلمة'}
    d.update(kw);return d
def qa(say,o,a,q='استمع ثم اختر الجواب المناسب',why=None):
    return {'t':'listen','q':q,'say':say,'o':o,'a':a,'why':why or 'المسموع: '+say}
def mono(L,idx,spk):
    s=L['sections'][idx];nb=[];ps=[]
    for b in s['b']:
        if 'p' in b and '｜' in b['p'] and len(b['p'])>60: ps.append([spk,b['p']])
        else:
            if ps: nb.append({'dlg':ps});ps=[]
            nb.append(b)
    if ps: nb.append({'dlg':ps})
    s['b']=nb
