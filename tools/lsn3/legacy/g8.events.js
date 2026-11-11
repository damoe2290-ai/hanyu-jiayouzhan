/* ---------- lesson-specific grammar widget handlers ---------- */
A.neg=function(t){var i=+t.dataset.i;G.neg[i]=!G.neg[i];renderGrammar()};
A.gm=function(t){G.m=+t.dataset.i;if(G.d>MDAYS[G.m-1])G.d=MDAYS[G.m-1];renderGrammar()};
A.gd=function(t){var n=G.d+(+t.dataset.s),mx=MDAYS[G.m-1];if(n<1)n=mx;if(n>mx)n=1;G.d=n;renderGrammar()};
A.gw=function(t){G.w=+t.dataset.i;renderGrammar()};
A.gtoday=function(){var n=new Date();G.m=n.getMonth()+1;G.d=n.getDate();G.w=(n.getDay()+6)%7;renderGrammar();speak('今天'+spokenZh())};
A.qy=function(t){var i=+t.dataset.i,k=t.dataset.k;G.qa[i]=(G.qa[i]===k?null:k);renderGrammar()};
A.own=function(t){G.own=+t.dataset.i;renderGrammar()};
A.thg=function(t){G.thg=+t.dataset.i;renderGrammar()};
