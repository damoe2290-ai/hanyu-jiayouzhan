import json,re
from pypinyin import pinyin,Style,load_phrases_dict
OV={'重耳':[['chóng'],['ěr']],'乐':[['yuè']],'逢蒙':[['páng'],['méng']],'曲阜':[['qū'],['fù']],'函谷关':[['hán'],['gǔ'],['guān']],'李耳':[['lǐ'],['ěr']],'字聃':[['zì'],['dān']],
'塔塔尔':[['tǎ'],['tǎ'],['ěr']],'柯尔克孜':[['kē'],['ěr'],['kè'],['zī']],'乌孜别克':[['wū'],['zī'],['bié'],['kè']],'哈萨克':[['hā'],['sà'],['kè']],'撒拉':[['sā'],['lā']],
'尕巴':[['gǎ'],['bā']],'阿訇':[['ā'],['hōng']],'馕':[['náng']],'蹴鞠':[['cù'],['jū']],'长辈':[['zhǎng'],['bèi']],'介子推':[['jiè'],['zǐ'],['tuī']],'毕昇':[['bì'],['shēng']],
'回纥':[['huí'],['hé']],'教无类':[['jiào'],['wú'],['lèi']],'祭灶':[['jì'],['zào']],'扫尘':[['sǎo'],['chén']],'汨罗江':[['mì'],['luó'],['jiāng']],'屈原':[['qū'],['yuán']],
'大食':[['dà'],['shí']],'朝鲜':[['cháo'],['xiǎn']],'吞下':[['tūn'],['xià']],'传说':[['chuán'],['shuō']],'陶冶':[['táo'],['yě']],'好事':[['hǎo'],['shì']],'数':[['shù']],'为了':[['wèi'],['le']],'几':[['jǐ']],'宰牲':[['zǎi'],['shēng']],'斋':[['zhāi']],'维吾尔':[['wéi'],['wú'],['ěr']],'东乡':[['dōng'],['xiāng']],'保安':[['bǎo'],['ān']],'仁':[['rén']],'礼':[['lǐ']],'都城':[['dū'],['chéng']],'重赏':[['zhòng'],['shǎng']],'重视':[['zhòng'],['shì']],'重点':[['zhòng'],['diǎn']],'重要':[['zhòng'],['yào']],'重午':[['chóng'],['wǔ']],'重午节':[['chóng'],['wǔ'],['jié']],'便利':[['biàn'],['lì']],'孔子':[['kǒng'],['zǐ']],'老子':[['lǎo'],['zǐ']],'公子':[['gōng'],['zǐ']],'弟子':[['dì'],['zǐ']],'孩子':[['hái'],['zi']],'妻子':[['qī'],['zi']],'母子':[['mǔ'],['zǐ']],'粽子':[['zòng'],['zi']],'柳树':[['liǔ'],['shù']],'守岁':[['shǒu'],['suì']]}
OV.update({'谁':[['shéi']],'什么':[['shén'],['me']],'怎么样':[['zěn'],['me'],['yàng']],'怎么':[['zěn'],['me']],'东西':[['dōng'],['xi']],'为什么':[['wèi'],['shén'],['me']],'觉得':[['jué'],['de']],'还':[['hái']],'行':[['xíng']],'地方':[['dì'],['fang']],'一下':[['yí'],['xià']],'晚上':[['wǎn'],['shang']],'上午':[['shàng'],['wǔ']],'便宜':[['pián'],['yi']],'师傅':[['shī'],['fu']],'先生':[['xiān'],['sheng']],'爸爸':[['bà'],['ba']],'妈妈':[['mā'],['ma']],'哥哥':[['gē'],['ge']],'弟弟':[['dì'],['di']],'姐姐':[['jiě'],['jie']],'妹妹':[['mèi'],['mei']],'朋友':[['péng'],['you']],'名字':[['míng'],['zi']],'学生':[['xué'],['sheng']],'喜欢':[['xǐ'],['huan']],'时候':[['shí'],['hou']],'认识':[['rèn'],['shi']],'本子':[['běn'],['zi']],'桌子':[['zhuō'],['zi']],'意思':[['yì'],['si']],'东京':[['dōng'],['jīng']],'了':[['le']],'聚会':[['jù'],['huì']],'行':[['xíng']],'长':[['cháng']],'好吗':[['hǎo'],['ma']],'谢谢':[['xiè'],['xie']],'漂亮':[['piào'],['liang']],'干净':[['gān'],['jìng']],'容易':[['róng'],['yì']],'月饼':[['yuè'],['bǐng']],'地铁':[['dì'],['tiě']],'吧':[['ba']],'呢':[['ne']],'吗':[['ma']],'的':[['de']]})
load_phrases_dict(OV)
CJK=re.compile(r'[一-鿿]')
import jieba,logging,os,tempfile
jieba.setLogLevel(logging.WARNING)
NUMS='〇零一二三四五六七八九'
FIX={'王小云':'Wáng Xiǎoyún','林娜':'Lín Nà','丁力波':'Dīng Lìbō','马大为':'Mǎ Dàwéi','宋华':'Sòng Huá','张教授':'Zhāng jiàoshòu','加拿大':'Jiānádà','美国':'Měiguó','北京':'Běijīng','中国':'Zhōngguó','汉语':'Hànyǔ','中文':'Zhōngwén','贝贝':'Bèibei','梁祝':'Liáng Zhù','韩国':'Hánguó','林小弟':'Lín Xiǎodì','日本':'Rìběn','英国':'Yīngguó','语言学院':'Yǔyán Xuéyuàn','张':'Zhāng','马':'Mǎ'}
BASE='你们 我们 他们 她们 一下 不是 认识 老师 学生 朋友 名字 学习 专业 学院 名片 介绍 教授 爸爸 妈妈 哥哥 姐姐 弟弟 妹妹 家人 照片 一共 可爱 当然 工作 医生 喜欢 多少 外语 外国 小狗 昨天 今天 明天 京剧 怎么样 有意思 天气 什么 时候 现在 游泳 打球 抱歉 恐怕 谢谢 时间 星期 上午 下午 生日 今年 出生 聚会 祝贺 参加 蛋糕 葡萄酒 红葡萄酒 快乐 漂亮 烤鸭 寿面 光盘 音乐 商场 常常 有名 本子 先生 师傅 香蕉 苹果 对不起 容易 多大 几号 哪儿 那儿 这儿 汉字 语言 文学 美术 中餐 西餐 晚上 学习 上网 起床 早饭 午饭 晚饭 为什么 有时候 教室 经常 衣服 现在 环保 问题 讨论 小区 觉得 饭馆 茶馆 非常 书店 图书馆 银行 超市 汽车 同学 一起 北京 再见 请坐 红酒 星期日 星期天 星期一 星期二 星期三 星期四 星期五 星期六 十月 十一月 十二月 一月 二月 三月 四月 五月 六月 七月 八月 九月 二十 三十 听力 打电话 手机 电脑 词典 汉语词典 电视 电影 书包 椅子 桌子 学校 宿舍 食堂 咖啡 饺子 面条 米饭 包子 玉米 豆腐 石榴 木瓜 橙子 葡萄 行李 机场 火车 飞机 公共汽车 出租车 自行车 地铁 公园 医院 邮局 商店 饭店 旅游 旅行 爱好 运动 足球 篮球 跑步 唱歌 跳舞 看书 看电视 做饭 睡觉 洗澡 上课 下课 开学 放假 考试 作业 练习 复习 预习 生词 课文 句子 汉字 拼音 声调 声母 韵母 发音'.split()
WORDS=set(BASE)|set(FIX)
_tk=[None]
def addw(words):
    n=len(WORDS)
    for w in words:
        if len(w)>1:WORDS.add(w)
    if len(WORDS)!=n:_tk[0]=None
def tk():
    if _tk[0] is None:
        f=os.path.join(tempfile.gettempdir(),'zhdict.txt')
        open(f,'w',encoding='utf8').write('\n'.join(w+' 1000' for w in sorted(WORDS))+'\n')
        t=jieba.Tokenizer(dictionary=f);t.initialize();_tk[0]=t
    return _tk[0]
import unicodedata
def tone(x):
    d=unicodedata.normalize('NFD',x)
    for m,t in (('\u0304',1),('\u0301',2),('\u030c',3),('\u0300',4)):
        if m in d:return t
    return 5
PM={'，':',','。':'.','、':',','；':';','：':':','！':'!','？':'?','《':'“','》':'”','（':'(','）':')','—':'—'}
def py(s):
    toks=tk().lcut(s,HMM=False)
    # split pure digit-character tokens into single chars
    T=[]
    for t in toks:
        if len(t)>1 and all(c in NUMS for c in t):T+=list(t)
        else:T.append(t)
    syl=[];ch=[];grp=[]   # grp: list of lists of indexes
    for t in T:
        idx=[]
        if t in FIX:
            grp.append(FIX[t]);continue
        items=pinyin(t,style=Style.TONE,errors=lambda x:[x])
        if all(CJK.match(c) for c in t) and len(items)==len(t):
            for c,it in zip(t,items):
                idx.append(len(syl));syl.append(it[0]);ch.append(c)
        else:
            for it in items:
                idx.append(len(syl));syl.append(it[0]);ch.append(t)
        grp.append(idx)
    for k,x in enumerate(syl):
        if x in('yī','bù') and k+1<len(syl):
            n=tone(syl[k+1])
            if x=='bù' and n==4:syl[k]='bú'
            elif x=='yī' and syl[k+1]!='yī' and ch[k+1] not in NUMS and ch[k+1]!='十':
                syl[k]='yí' if n==4 else 'yì'
    out=[]
    for idx in grp:
        if isinstance(idx,str):
            out.append(idx);continue
        w=''.join(syl[i] for i in idx) if len(idx)>1 and all(CJK.match(ch[i]) for i in idx) else ' '.join(syl[i] for i in idx)
        out.append(w)
    r=' '.join(out)
    r=''.join(PM.get(c,c) for c in r)
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
    addw([t['zh'] for t in L['terms']])
    acc={}
    collect({k:v for k,v in L.items() if k!='terms'},acc)
    for t in L['terms']:
        if t['ex']:collect(t['ex'],acc)
    L['py']=acc
    # sanity: terms must appear in text
    txt=json.dumps(L['sections'],ensure_ascii=False)+json.dumps(L['practice'],ensure_ascii=False)
    html=tpl.replace('%%TOKENS%%',tokens).replace('%%TITLE%%',L['title_ar']+' · '+L['title_zh']).replace('%%DATA%%',json.dumps(L,ensure_ascii=False,separators=(',',':')))
    return html
