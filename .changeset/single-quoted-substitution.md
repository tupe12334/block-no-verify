---
'block-no-verify': patch
---

Stop false "could not parse" blocks when single-quoted or escaped text holds `${…:-$(…)}`, as in `printf '%s' '${x:-$(( 1 ))}'`. The message-masking rebuild joined words without their quotes, so a later parse read the literal text as an expansion and threw `Bad substitution`. In a rebuilt word that holds a `$`, each `\`, `$` and backtick is now backslash-escaped (for example `SKIP=lint\$x`). No quote is added, so the regex checks for `NAME=` and `core.hooksPath=` still match at the start of the word. An unquoted `${…:-$(…)}`, including one in a `bash -c` payload, still fails closed.
