# Lesson 7 (Grammar 1 / Foreign Language): a hand-built lesson moved onto tpl.html.
# Its lesson-specific code (vocabulary, drawings, picture quiz, interactive grammar, writing notes, extra quiz kinds)
# is frozen as readable snippets in legacy/g7.*.js (extracted once by mk_legacy.py); build3.py puts them into the
# extras slots of the template. 'key' keeps the page's original localStorage key so saved progress survives.
L={'course':'gram','n':7,'title_zh':'中国银行在哪儿','seal':'七','sub':'第七课 · 中国银行在哪儿','key':'noor-lesson7-v1','legacy':'g7'}

# Stroke order with Hanzi Writer in the Writing tab (vendored in vendor/hanzi-writer/; falls back to the free-drawing canvas).
# The frozen snippet legacy/g7.writing.js calls hwInit() (the only change to it: done marker on the chips + that call).
L['hanzi_writer']=True
