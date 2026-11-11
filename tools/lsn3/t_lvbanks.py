"""Unit test for build3.lv_banks (levels challenge banks).   cd tools/lsn3 && python3 t_lvbanks.py   (needs jieba + pypinyin)
Checks: deterministic (no random numbers), balanced true/false, glosses of false statements really differ, typed-character
bank has only short unambiguous words, manual extras are merged and validated, lessons without levels get no banks."""
import sys,copy
sys.path.insert(0,'.')
import build3,g9,g10
fails=0
def ok(name,cond):
    global fails
    print(('ok   ' if cond else 'FAIL ')+name)
    if not cond: fails+=1
data,_,_=build3.build(copy.deepcopy(g9.L))
vocab,fills=data['vocab'],data['fill']
ok('lesson 9 data carries banks (L[levels] is set)','lv' in data)
a=build3.lv_banks(vocab,fills,g9.L);b=build3.lv_banks(vocab,fills,g9.L)
ok('banks are deterministic (identical on a second call)',a==b)
tf=a['tf']
ok('true/false bank is balanced 10 / 10',len(tf)==20 and sum(x['a'] for x in tf)==10)
ok('every false statement uses another word\'s meaning',all(x['a'] or x['ar']!=vocab[x['w']]['ar'] for x in tf))
ok('every true statement uses the word\'s own meaning',all((not x['a']) or x['ar']==vocab[x['w']]['ar'] for x in tf))
ok('typed-pinyin bank has no parenthetical-gloss particles',all(not vocab[x['w']]['ar'].startswith('(') for x in a['py']))
ok('typed-character bank: words of 1-3 characters with a unique gloss',all(len(x['ans'])<=3 and sum(1 for v in vocab if v['ar']==x['ar'])==1 for x in a['zh']))
ok('sentence bank: 4-16 Chinese characters, no duplicates',len({x['ans'] for x in a['sent']})==len(a['sent'])and all(4<=len([c for c in x['ans'] if '一'<=c<='鿿'])<=16 for x in a['sent']))
ok('cloze bank = every fill-in item of the lesson',len(a['cloze'])==len(fills))
ok('default pass rate is 0.75',a['pass']==0.75)
L2=dict(g9.L,lv_extra=[{'kind':'type_sent','ar':'x','ans':'我好。'},{'kind':'tf','zh':'好','py':'hǎo','ar':'جيد','a':1}],lv_pass=0.5)
m=build3.lv_banks(vocab,fills,L2)
ok('manual extras are merged and marked',m['sent'][-1].get('manual')==1 and m['tf'][-1].get('manual')==1 and len(m['sent'])==len(a['sent'])+1)
ok('pass rate can be set per lesson',m['pass']==0.5)
def raises(extra):
    try: build3.lv_banks(vocab,fills,dict(g9.L,lv_extra=[extra]));return False
    except AssertionError: return True
ok('unknown manual kind is rejected',raises({'kind':'nope'}))
ok('manual question with a missing field is rejected',raises({'kind':'type_zh','py':'hǎo','ar':'جيد'}))
d10,_,_=build3.build(copy.deepcopy(g10.L))
ok('lessons without L[levels] get no banks (lesson 10)','lv' not in d10)
print('all passed' if not fails else '%d FAILED'%fails)
sys.exit(1 if fails else 0)
