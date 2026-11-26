# Assembles the self-contained prototypes: src/dN.html + src/base.css + src/common.js + data.json -> lab-style/direction-N.html
import os,re
H=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(H))
data=open(os.path.join(H,'data.json'),encoding='utf8').read()
common=open(os.path.join(H,'src','common.js'),encoding='utf8').read().replace('/*DATA*/',data)
base=open(os.path.join(H,'src','base.css'),encoding='utf8').read()
for n in range(1,5):
  p=os.path.join(H,'src','d%d.html'%n)
  if not os.path.exists(p):continue
  s=open(p,encoding='utf8').read().replace('/*BASECSS*/',base).replace('/*COMMON*/',common)
  open(os.path.join(ROOT,'lab-style','direction-%d.html'%n),'w',encoding='utf8').write(s)
  print('direction-%d.html'%n,len(s.encode()),'bytes')
