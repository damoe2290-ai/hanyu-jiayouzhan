"""Wrap a generated page fragment into the hosted document: python3 wrap2.py <file.html> -> w-<file>.html

The leading run of head-type elements of the fragment (<title>, <meta>, <link>, <style>, <script src>) is moved into a
real <head>, in the same order, so the cascade is unchanged (page <style> first, then zh-ui.css, which only overrides).
Everything after that run stays in <body>."""
import sys,re
HEAD_RE=re.compile(r'\s*(<title>.*?</title>|<meta\b[^>]*>|<link\b[^>]*>|<style\b[^>]*>.*?</style>|<script\b[^>]*\bsrc=[^>]*>\s*</script>)',re.S)
def split_head(s):
    pos=0;items=[]
    while True:
        m=HEAD_RE.match(s,pos)
        if not m: break
        items.append(m.group(1));pos=m.end()
    return '\n'.join(items),s[pos:]
for f in sys.argv[1:]:
    s=open(f,encoding='utf8').read()
    head,body=split_head(s)
    w=('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'
       '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
       '<style>html,body{margin:0}img,svg{max-width:100%}</style>\n'+head+'\n</head><body>'+body+'</body></html>')
    open('w-'+f,'w',encoding='utf8').write(w)
