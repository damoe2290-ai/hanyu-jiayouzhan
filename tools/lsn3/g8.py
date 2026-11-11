# Lesson 8 (Grammar 1 / Foreign Language): a hand-built lesson moved onto tpl.html.
# Its lesson-specific code (vocabulary, drawings, picture quiz, interactive grammar, writing notes, extra quiz kinds)
# is frozen as readable snippets in legacy/g8.*.js (extracted once by mk_legacy.py); build3.py puts them into the
# extras slots of the template. 'key' keeps the page's original localStorage key so saved progress survives.
L={'course':'gram','n':8,'title_zh':'今天几号','seal':'八','sub':'第八课 · 今天几号','key':'noor-lesson8-v1','legacy':'g8'}

# Stroke order with Hanzi Writer in the Writing tab (vendored in vendor/hanzi-writer/; falls back to the free-drawing canvas).
# The frozen snippet legacy/g8.writing.js calls hwInit() (the only change to it: done marker on the chips + that call).
L['hanzi_writer']=True
# Levels challenge (rolled out after the Lesson 9 sample was approved). The banks are generated from VOCAB and FILL in
# legacy/g8.data.js (build3.legacy_lv_banks). Hand-written questions, if any, go ONLY in L['lv_extra']; none written.
L['levels']=True
