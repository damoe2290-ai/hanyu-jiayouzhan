/* ---------- lesson-specific grammar widget handlers ---------- */
A.th=function(t){G.th=+t.dataset.i;renderGrammar()};
A.ld=function(t){G.ld=+t.dataset.i;renderGrammar()};
A.ps=function(t){G.ps=+t.dataset.i;renderGrammar()};
A.hai=function(t){G.hai=+t.dataset.i;renderGrammar()};
A.haion=function(){G.haiOn=!G.haiOn;renderGrammar()};
A.bapick=function(t){G.pos=+t.dataset.i;renderGrammar()};
A.baon=function(){var k=G.pos%BA.length;G.ba[k]=!G.ba[k];renderGrammar()};
A.cp=function(t){G.cp=+t.dataset.i;renderGrammar()};
A.pl=function(t){G.pl=+t.dataset.i;renderGrammar()};
