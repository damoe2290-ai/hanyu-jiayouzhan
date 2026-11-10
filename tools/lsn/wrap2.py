import sys,glob
for f in sys.argv[1:]:
    s=open(f,encoding='utf8').read()
    w='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>html,body{margin:0}img,svg{max-width:100%}</style></head><body>'+s+'</body></html>'
    open('w-'+f,'w',encoding='utf8').write(w)
