"""Vendors Hanzi Writer (stroke-order animation and writing practice) into vendor/hanzi-writer/.

    python3 tools/hanzi_data.py <hanzi-writer-3.7.3.tgz> <hanzi-writer-data-2.0.1.tgz>   write vendor/hanzi-writer/
    python3 tools/hanzi_data.py --check                                                   list lesson characters without stroke data

Get the two tarballs with `npm pack hanzi-writer@3.7.3 hanzi-writer-data@2.0.1` (or download them from the npm registry).
Both are verified against the SHA-512 hashes npm publishes before anything is read. No archive is extracted wholesale:
only the members this script names are read, and each is validated.

What is copied:
  - hanzi-writer.min.js (verbatim, MIT) with its LICENSE and COPYING.md;
  - the stroke data of ONLY the characters that occur in the lesson pages (lesson-*, prac-*, lis-*, biz-*, cult-*),
    as data/<hex code point>.json, each file byte-identical to the one in hanzi-writer-data (Arphic Public License);
  - ARPHICPL.TXT (unaltered, required by that licence) and its APL/ translations, NOTICE.md and CHARS.txt.
Run `--check` after adding lessons: characters without data fall back to the free-drawing canvas, nothing breaks."""
import sys,os,re,glob,tarfile,hashlib,base64,io,datetime

LIB=('hanzi-writer','3.7.3','sha512-fdOFrb1cXWL/pV/oplJkcdziCvjJzhhf+qoIBm5IpVGxPBZEu4eLB6ZG5RJDbKXyNbNlyx8oIpa3XrcUBcSXpg==')
DATA=('hanzi-writer-data','2.0.1','sha512-nbQwM+MaryGoq7pBMIZLCd3lFq03nXuJuwku1+6UbjL58uU+9OULVcMkoNvNuJSoIV7f1bbPRfD4D/LQa5S7qg==')
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'vendor','hanzi-writer')
HAN=re.compile('[㐀-䶿一-鿿]')
PSEUDO={'㐀','鿿'}      # endpoints of CJK ranges that appear inside the pages' code, not real lesson characters
PAGES=['lesson-*.html','prac-*.html','lis-*.html','biz-*.html','cult-*.html','beginners-*.html']

def lesson_chars():
    s=set()
    for pat in PAGES:
        for p in sorted(glob.glob(os.path.join(ROOT,pat))):
            s|=set(HAN.findall(open(p,encoding='utf8').read()))
    return sorted(s-PSEUDO)
def hexname(c): return '%x'%ord(c)

def check():
    nodata=set()
    f=os.path.join(OUT,'NODATA.txt')
    if os.path.exists(f): nodata=set(open(f,encoding='utf8').read().split())
    chars=lesson_chars();miss=[c for c in chars if not os.path.exists(os.path.join(OUT,'data',hexname(c)+'.json')) and c not in nodata]
    print('lesson characters: %d | stroke data present: %d | without data: %d %s'%(len(chars),len(chars)-len(miss)-len(nodata&set(chars)),len(miss)+len(nodata&set(chars)),''.join(miss)))
    return 1 if miss else 0

def verified(path,spec):
    raw=open(path,'rb').read()
    got='sha512-'+base64.b64encode(hashlib.sha512(raw).digest()).decode()
    if got!=spec[2]: sys.exit('integrity mismatch for %s (expected %s@%s)'%(path,spec[0],spec[1]))
    return raw
def member(tar,name):
    if name.startswith('/') or '..' in name.split('/'): raise ValueError(name)
    m=tar.getmember('package/'+name)
    if not m.isfile(): raise ValueError(name)
    return tar.extractfile(m).read()
def write(path,data):
    os.makedirs(os.path.dirname(path),exist_ok=True)
    open(path,'wb').write(data)

def build(lib_tgz,data_tgz):
    lib=tarfile.open(fileobj=io.BytesIO(verified(lib_tgz,LIB)),mode='r:gz')
    dat=tarfile.open(fileobj=io.BytesIO(verified(data_tgz,DATA)),mode='r:gz')
    write(os.path.join(OUT,'hanzi-writer.min.js'),member(lib,'dist/hanzi-writer.min.js'))
    write(os.path.join(OUT,'LICENSE'),member(lib,'LICENSE'))
    write(os.path.join(OUT,'COPYING.md'),member(lib,'COPYING.md'))
    write(os.path.join(OUT,'ARPHICPL.TXT'),member(dat,'ARPHICPL.TXT'))
    for m in dat.getmembers():                                   # the APL/ translations of the licence, verbatim
        if m.isfile() and m.name.startswith('package/APL/'):
            write(os.path.join(OUT,m.name[len('package/'):]),dat.extractfile(m).read())
    chars=lesson_chars();have=[];nodata=[]
    old=os.path.join(OUT,'data')
    if os.path.isdir(old):
        for f in os.listdir(old):
            if f.endswith('.json'): os.remove(os.path.join(old,f))
    for c in chars:
        try: raw=member(dat,c+'.json')
        except KeyError: nodata.append(c);continue
        write(os.path.join(OUT,'data',hexname(c)+'.json'),raw);have.append(c)
    write(os.path.join(OUT,'CHARS.txt'),(''.join(have)+'\n').encode('utf8'))
    write(os.path.join(OUT,'NODATA.txt'),(' '.join(nodata)+'\n').encode('utf8'))
    note=f'''# Vendored: Hanzi Writer

Stroke-order animation and stroke-by-stroke writing practice for the Writing tab. Everything here is served from this
folder: no external request is made. If a file is missing or fails to load, the page falls back to the free-drawing canvas.

| Part | Source | Version | Licence |
|---|---|---|---|
| `hanzi-writer.min.js` | npm `{LIB[0]}` (https://github.com/chanind/hanzi-writer), unmodified | {LIB[1]} | MIT (`LICENSE`) |
| `data/<hex code point>.json` | npm `{DATA[0]}` (stroke data derived from Make Me a Hanzi and Arphic fonts), unmodified | {DATA[1]} | Arphic Public License (`ARPHICPL.TXT`, translations in `APL/`) |

- Integrity: both npm tarballs were checked against the SHA-512 hashes published by npm (`{LIB[2][:30]}...`, `{DATA[2][:30]}...`).
- Selection: `data/` holds the stroke data of only the {len(have)} characters that occur in the lesson pages (see `CHARS.txt`); {len(nodata)} character(s) have no upstream data (`NODATA.txt`). Each file is a byte-identical copy of the file with the same character in `{DATA[0]}@{DATA[1]}`; files are named by hexadecimal code point (for example `597d.json` is 好).
- Date of this selection: {datetime.date.today().isoformat()}. It is a subset only: no stroke data was edited, which keeps the files verbatim copies under section 1 of the Arphic Public License; the licence file is retained unaltered.
- Copyright notices (also in `COPYING.md`): Arphic PL KaitiM GB and UKai, Copyright 1999 Arphic Technology Co., Ltd.; Make Me a Hanzi, Copyright 1999 Arphic Technology Co., Ltd., copyright 2016 Shaunak Kishore; Hanzi Writer, Copyright (c) 2014 David Chanin. There is no warranty.
- Regenerate or extend (after adding lessons): `npm pack {LIB[0]}@{LIB[1]} {DATA[0]}@{DATA[1]}`, then `python3 tools/hanzi_data.py <lib.tgz> <data.tgz>`. `python3 tools/hanzi_data.py --check` lists lesson characters without stroke data.
'''
    write(os.path.join(OUT,'NOTICE.md'),note.encode('utf8'))
    print('vendor/hanzi-writer: library %s, data for %d characters, %d without upstream data %s'%(LIB[1],len(have),len(nodata),''.join(nodata)))

if __name__=='__main__':
    if len(sys.argv)==2 and sys.argv[1]=='--check': sys.exit(check())
    if len(sys.argv)!=3: sys.exit(__doc__)
    build(sys.argv[1],sys.argv[2])
