import core2
from core2 import T
core2.load_phrases_dict({'差':[['chà']],'一刻':[['yí'],['kè']],'差一刻':[['chà'],['yí'],['kè']],'那里':[['nà'],['li']],'一点儿':[['yì'],['diǎn'],['r']],'马丁':[['mǎ'],['dīng']],'山田':[['shān'],['tián']],'崔浩':[['cuī'],['hào']],'半':[['bàn']],'啊':[['a']],'大家':[['dà'],['jiā']],'休息':[['xiū'],['xi']],'呼吸':[['hū'],['xī']],'风景':[['fēng'],['jǐng']],'关':[['guān']],'冷':[['lěng']],'贵':[['guì']],'空气':[['kōng'],['qì']],'新鲜':[['xīn'],['xiān']]})
core2.FIX.update({'马丁':'Mǎdīng','山田':'Shāntián','崔浩':'Cuī Hào','西山公园':'Xīshān Gōngyuán','西山':'Xīshān','英文':'Yīngwén','朱云':'Zhū Yún','王影':'Wáng Yǐng','李老师':'Lǐ lǎoshī'})
MD='马丁｜مارتن';LN='林娜｜لين نا';SD='山田｜ياماده';CH='崔浩｜تسوي هاو';FR='朋友｜الصديق';ALL='大家｜الجميع';ME='我｜أنا'
def base(n,big,zh,ar,intro,**kw):
    d={'n':n,'course':'gram','cname':'قواعد ١','big':big,'title_zh':zh,'title_ar':ar,'intro_ar':intro,'defpy':1,'minc':14,'tword':'كلمة'}
    d.update(kw);return d
core2.load_phrases_dict({'西山':[['xī'],['shān']],'西山公园':[['xī'],['shān'],['gōng'],['yuán']],'哪儿':[['nǎ'],['r']],'这个':[['zhè'],['ge']],'那个':[['nà'],['ge']],'早上':[['zǎo'],['shang']],'卫生间':[['wèi'],['shēng'],['jiān']],'星期天':[['xīng'],['qī'],['tiān']],'一点儿':[['yì'],['diǎn'],['r']]})
core2.addw(['西山','西山公园','马丁','山田','崔浩','英文','卫生间','这个','那个','早上','星期天','哪儿','一点儿','茶馆','城市','空气','买东西','喝咖啡','电影院','大家'])
import re as _re
_o=core2.py
def _py(s):
    r=_o(s)
    r=_re.sub(r'(?i)\b(\w+) b[uùú] (\1)\b',lambda m:m.group(1)+' bu '+m.group(2),r)
    r=_re.sub(r'(\w+) b[uùú] (\w+)(?=[ ,.?!])',lambda m:m.group(0) if m.group(1).lower()!=m.group(2).lower() else m.group(1)+' bu '+m.group(2),r)
    return r
core2.py=_py
core2.load_phrases_dict({'留学生':[['liú'],['xué'],['shēng']]});core2.addw(['留学生'])
