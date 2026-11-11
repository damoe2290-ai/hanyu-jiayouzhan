"""Lesson order and Chinese titles, used only to build the previous / next lesson links.

This is a static table on purpose: importing the lesson data modules while another lesson is being built would
change shared tokenizer state and could change that lesson's generated output.
Keep it in sync with the data modules:  python3 order.py   (exits non-zero on any mismatch).
The hub's own lesson list (tools/hub.html, LESSONS / MATS) is still maintained separately.
"""
FILES={'gram':'lesson-%d.html','prac':'prac-%d.html','lis':'lis-%d.html','biz':'biz-%d.html','cult':'cult-%d.html'}
PRE={'gram':'g','prac':'r','lis':'s','biz':'b'}      # data-module prefix per course (cult uses ck.py)
LESSONS={
 'gram':[(6,'香蕉多少钱一斤'),(7,'中国银行在哪儿'),(8,'今天几号'),(9,'你今天有什么安排'),(10,'这个星期天你忙不忙')],
 'prac':[(6,'我们去游泳，好吗'),(7,'你认识不认识他'),(8,'你们家有几口人'),(9,'他今年二十岁'),(10,'我在这儿买光盘')],
 'lis': [(6,'苹果多少钱一斤'),(7,'留学生楼在哪儿'),(8,'今天星期几'),(9,'你每天几点起床'),(10,'你们小区真漂亮')],
 'biz': [(4,'我想约个时间和您见面'),(5,'为了大家的健康干杯'),(6,'还有其他颜色吗？')],
 'cult':[(1,'中国的哲学家'),(2,'中国的节日'),(3,'伊斯兰教与中国穆斯林民族'),(4,'中国四大发明')],
}

def check():
    import importlib,sys
    sys.path.insert(0,'.')
    bad=0
    for c,rows in LESSONS.items():
        for n,t in rows:
            if c=='cult':
                import ck; got=ck.LS[n]['title_zh']
            else:
                got=importlib.import_module('%s%d'%(PRE[c],n)).L['title_zh']
            if got!=t: bad+=1;print('MISMATCH',c,n,repr(t),'!=',repr(got))
    print('order.py: %d mismatch(es)'%bad)
    return bad

if __name__=='__main__':
    raise SystemExit(1 if check() else 0)
