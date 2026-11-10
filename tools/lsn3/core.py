import json,re
from pypinyin import pinyin,Style,load_phrases_dict
OV={'重耳':[['chóng'],['ěr']],'乐':[['yuè']],'逢蒙':[['páng'],['méng']],'曲阜':[['qū'],['fù']],'函谷关':[['hán'],['gǔ'],['guān']],'李耳':[['lǐ'],['ěr']],'字聃':[['zì'],['dān']],
'塔塔尔':[['tǎ'],['tǎ'],['ěr']],'柯尔克孜':[['kē'],['ěr'],['kè'],['zī']],'乌孜别克':[['wū'],['zī'],['bié'],['kè']],'哈萨克':[['hā'],['sà'],['kè']],'撒拉':[['sā'],['lā']],
'尕巴':[['gǎ'],['bā']],'阿訇':[['ā'],['hōng']],'馕':[['náng']],'蹴鞠':[['cù'],['jū']],'长辈':[['zhǎng'],['bèi']],'介子推':[['jiè'],['zǐ'],['tuī']],'毕昇':[['bì'],['shēng']],
'回纥':[['huí'],['hé']],'教无类':[['jiào'],['wú'],['lèi']],'祭灶':[['jì'],['zào']],'扫尘':[['sǎo'],['chén']],'汨罗江':[['mì'],['luó'],['jiāng']],'屈原':[['qū'],['yuán']],
'大食':[['dà'],['shí']],'朝鲜':[['cháo'],['xiǎn']],'吞下':[['tūn'],['xià']],'传说':[['chuán'],['shuō']],'陶冶':[['táo'],['yě']],'好事':[['hǎo'],['shì']],'数':[['shù']],'为了':[['wèi'],['le']],'几':[['jǐ']],'宰牲':[['zǎi'],['shēng']],'斋':[['zhāi']],'维吾尔':[['wéi'],['wú'],['ěr']],'东乡':[['dōng'],['xiāng']],'保安':[['bǎo'],['ān']],'仁':[['rén']],'礼':[['lǐ']],'都城':[['dū'],['chéng']],'重赏':[['zhòng'],['shǎng']],'重视':[['zhòng'],['shì']],'重点':[['zhòng'],['diǎn']],'重要':[['zhòng'],['yào']],'重午':[['chóng'],['wǔ']],'重午节':[['chóng'],['wǔ'],['jié']],'便利':[['biàn'],['lì']],'孔子':[['kǒng'],['zǐ']],'老子':[['lǎo'],['zǐ']],'公子':[['gōng'],['zǐ']],'弟子':[['dì'],['zǐ']],'孩子':[['hái'],['zi']],'妻子':[['qī'],['zi']],'母子':[['mǔ'],['zǐ']],'粽子':[['zòng'],['zi']],'柳树':[['liǔ'],['shù']],'守岁':[['shǒu'],['suì']]}
load_phrases_dict(OV)
CJK=re.compile(r'[一-鿿]')
def py(s):
    out=[]
    for it in pinyin(s,style=Style.TONE,errors=lambda x:[x]):
        out.append(it[0])
    r=' '.join(out)
    for a,b in zip('，。、；：！？《》（）“”','，。，；：！？“”()""'):pass
    M={'，':',','。':'.','、':',','；':';','：':':','！':'!','？':'?','《':'“','》':'”','（':'(','）':')','—':'—'}
    r=''.join(M.get(c,c) for c in r)
    r=re.sub(r'\s+([,.;:!?)”])',r'\1',r)
    r=re.sub(r'([（“《(])\s+',r'\1',r)
    r=re.sub(r'\s{2,}',' ',r).strip()
    return r
def iscjk(s):
    ch=[c for c in s if not c.isspace() and c not in '，。、；：！？“”《》（）—·…,.;:!?()"\'0-9']
    if not ch:return False
    return sum(1 for c in ch if CJK.match(c))/len(ch)>0.6
def collect(o,acc):
    if isinstance(o,str):
        z=o.split('｜')[0]
        z2=z.replace('___','＿＿')
        if iscjk(z):
            acc[z]=py(z)
            if z2!=z: acc[z2]=py(z2)
    elif isinstance(o,list):
        for x in o:collect(x,acc)
    elif isinstance(o,dict):
        for k,v in o.items():
            if k in('py','terms'):continue
            collect(v,acc)
def T(zh,ar,ex=None,p=None):
    return {'zh':zh,'ar':ar,'py':p or py(zh),'ex':ex}
def build(L,tpl,tokens):
    acc={}
    collect({k:v for k,v in L.items() if k!='terms'},acc)
    for t in L['terms']:
        if t['ex']:collect(t['ex'],acc)
    L['py']=acc
    # sanity: terms must appear in text
    txt=json.dumps(L['sections'],ensure_ascii=False)+json.dumps(L['practice'],ensure_ascii=False)
    html=tpl.replace('%%TOKENS%%',tokens).replace('%%TITLE%%',L['title_ar']+' · '+L['title_zh']).replace('%%DATA%%',json.dumps(L,ensure_ascii=False,separators=(',',':')))
    return html
