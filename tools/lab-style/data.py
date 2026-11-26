# Builds the shared data of the style prototypes from REAL lesson-10 content
# (the generated lesson-10.html's data block, the lesson module g10.py and tools/levels.json).
import json,re,sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0,os.path.join(ROOT,'tools','lsn3'))
h=open(os.path.join(ROOT,'lesson-10.html'),encoding='utf8').read()
i=h.index('var D=');D,_=json.JSONDecoder().raw_decode(h[i+6:])
import g10;L=g10.L
gram=D['gram'];trip={}
for m in re.finditer(r'<span class="z" dir="ltr">(.*?)</span><span class="mut py" dir="ltr">(.*?)</span><span>(.*?)</span>',gram):trip[m.group(1)]=[m.group(1),m.group(2),m.group(3)]
def ex(z):
  if z in trip:return trip[z]
  raise SystemExit('no pinyin for '+z)
vocab=[[v['zh'],v['py'],v['ar']]+v['ex'] for v in D['vocab']]
texts=[];spk=D['spk']
for k,t in sorted(D['txt'].items()):
  lines=[d for d in D['dlg'] if str(d['text'])==k]
  texts.append({'h':t['h'],'scene':[l['ar'] for l in lines if l['who']=='N'][0] if any(l['who']=='N' for l in lines) else '',
    'lines':[{'who':l['who'],'name':spk[l['who']]['n'],'av':spk[l['who']]['a'],'zh':l['zh'],'ar':l['ar'],'tok':[t2[:3] if len(t2)>1 else [t2[0],'',''] for t2 in l['tok']]} for l in lines if l['who']!='N']})
G=[
 {'id':'adj','t':'الصفة خبرًا','f':'S + 很/非常 + Adj','ar':'لا نضع «是» بين المبتدأ والصفة، وغالبًا نضع قبل الصفة ظرف درجة مثل «很» أو «非常».','key':'风景非常漂亮。','re':'非常|很'},
 {'id':'anq','t':'سؤال الإيجاب والنفي','f':'Adj/V + 不 + Adj/V ？','ar':'بدل «你忙吗？» نكرّر الصفة أو الفعل مع «不» بينهما. والجواب: «我不忙» أو «我很忙».','key':'这个星期天你忙不忙？','ex':['你去不去？','你喝不喝茶？','你看不看电影？'],'re':'(.)不\\1'},
 {'id':'yx','t':'الفعل + 一下','f':'V + 一下','ar':'بعد الفعل تعني «قليلًا / لمرة / جرّب»، فتلطّف الطلب.','key':'我们休息一下吧。','ex':['我很累，我想休息一下。','我去一下卫生间。'],'re':'一下'},
 {'id':'ydr','t':'一点儿 + اسم','f':'(一)点儿 + N','ar':'«قليل من» وتأتي قبل الاسم، وفي الكلام نحذف «一» غالبًا.','key':'我们去那儿喝一点儿茶，好不好？','ex':['我买（一）点儿苹果。','我们喝（一）点儿水吧。'],'re':'点儿'}]
KPY={'风景非常漂亮。':'Fēngjǐng fēicháng piàoliang.','这个星期天你忙不忙？':'Zhège xīngqītiān nǐ máng bu máng?','我们休息一下吧。':'Wǒmen xiūxi yíxià ba.','我们去那儿喝一点儿茶，好不好？':'Wǒmen qù nàr hē yìdiǎnr chá, hǎo bu hǎo?'}
for g in G:
  g['kpy']=KPY[g['key']]
  g['ex']=[ex(z) for z in g.get('ex',[])]
quiz=[]
for p in L['practice']:
  if p['t']=='mcq':quiz.append({'k':'mcq','q':p['q'],'o':p['o'],'a':p['a'],'why':p.get('why','')})
  if p['t']=='tf':quiz.append({'k':'mcq','q':p['q'],'o':['صحيح','خطأ'],'a':0 if p['a'] else 1,'why':p.get('why','')})
match=[pp for p in L['practice'] if p['t']=='match' for pp in [p['p']]]
order=[{'tok':s['tokens'],'zh':s['zh'],'py':s['py'],'ar':s['ar']} for s in D['sent']]
fill=[{k:f[k] for k in ('pre','post','ans','opts','ar','py')} for f in D['fill']]
LV=json.load(open(os.path.join(ROOT,'tools','levels.json'),encoding='utf8'))
hub={'levels':[{'n':l['n'],'t':l['title'],'s':l['sub'],'c':l['courses']} for l in LV['levels']],
     'courses':{k:{'name':c['name'],'book':c.get('book',''),'l':[[x['no'],x['n'],x['title'],x.get('desc',''),x['file'],x.get('key','')] for x in c['lessons']]} for k,c in LV['courses'].items() if 'lessons' in c}}
DATA={'meta':{'n':10,'nz':'十','zh':L['title_zh'],'ar':'الدرس العاشر','sub':L['title_ar'].split('·')[-1].strip(),'intro':L['intro_ar'],'course':'قواعد ١','book':'《发展汉语初级综合1》','file':'lesson-10.html'},
 'vocab':vocab,'texts':texts,'gram':G,'quiz':quiz,'match':match,'order':order,'fill':fill,'hub':hub}
out=json.dumps(DATA,ensure_ascii=False,separators=(',',':'))
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'data.json'),'w',encoding='utf8').write(out)
print(len(out),'bytes;',len(vocab),'words;',sum(len(t['lines']) for t in texts),'lines;',len(quiz),'mcq;',len(order),'order;',len(fill),'fill;',len(match),'match')
