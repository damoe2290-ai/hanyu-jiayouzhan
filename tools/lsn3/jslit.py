"""Read a JavaScript literal (array / object / string / number / true / false / null) out of a frozen legacy snippet.

Used only by build3.py to generate the levels-challenge banks of the hand-built lessons 6-8 from the vocabulary and
fill-in items that live in legacy/g<N>.data.js (the snippet stays the single source of truth; nothing is copied).
Supports what those snippets use: single- or double-quoted strings with backslash escapes, unquoted or quoted object
keys, trailing commas, // and /* */ comments. It is deliberately small and raises on anything else.
"""
import re

class JSLitError(ValueError):
    pass

_WS = re.compile(r'(?:\s+|//[^\n]*|/\*.*?\*/)+', re.S)
_NUM = re.compile(r'-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?')
_KEY = re.compile(r'[A-Za-z_$][A-Za-z_$0-9]*')
_ESC = {'n': '\n', 't': '\t', 'r': '\r', 'b': '\b', 'f': '\f', 'v': '\v', '0': '\0', '\n': ''}

def _skip(s, i):
    m = _WS.match(s, i)
    return m.end() if m else i

def _string(s, i):
    q = s[i]; i += 1; out = []
    while i < len(s):
        c = s[i]
        if c == '\\':
            n = s[i + 1]
            if n == 'u':
                out.append(chr(int(s[i + 2:i + 6], 16))); i += 6; continue
            if n == 'x':
                out.append(chr(int(s[i + 2:i + 4], 16))); i += 4; continue
            out.append(_ESC.get(n, n)); i += 2; continue
        if c == q:
            return ''.join(out), i + 1
        out.append(c); i += 1
    raise JSLitError('unterminated string')

def _value(s, i):
    i = _skip(s, i)
    c = s[i]
    if c in '\'"':
        return _string(s, i)
    if c == '[':
        arr = []; i = _skip(s, i + 1)
        while s[i] != ']':
            v, i = _value(s, i); arr.append(v); i = _skip(s, i)
            if s[i] == ',': i = _skip(s, i + 1)
            elif s[i] != ']': raise JSLitError('expected , or ] at %d' % i)
        return arr, i + 1
    if c == '{':
        obj = {}; i = _skip(s, i + 1)
        while s[i] != '}':
            if s[i] in '\'"': k, i = _string(s, i)
            else:
                m = _KEY.match(s, i)
                if not m: raise JSLitError('bad key at %d: %r' % (i, s[i:i + 20]))
                k, i = m.group(0), m.end()
            i = _skip(s, i)
            if s[i] != ':': raise JSLitError('expected : at %d' % i)
            v, i = _value(s, i + 1); obj[k] = v; i = _skip(s, i)
            if s[i] == ',': i = _skip(s, i + 1)
            elif s[i] != '}': raise JSLitError('expected , or } at %d' % i)
        return obj, i + 1
    m = _NUM.match(s, i)
    if m:
        t = m.group(0); return (float(t) if re.search(r'[.eE]', t) else int(t)), m.end()
    for word, val in (('true', True), ('false', False), ('null', None)):
        if s.startswith(word, i): return val, i + len(word)
    raise JSLitError('unsupported literal at %d: %r' % (i, s[i:i + 20]))

def var(text, name):
    """The value of the top-level `var NAME=<literal>;` in a JavaScript snippet."""
    m = re.search(r'^var\s+%s\s*=' % re.escape(name), text, re.M)
    if not m: raise KeyError(name)
    return _value(text, m.end())[0]
