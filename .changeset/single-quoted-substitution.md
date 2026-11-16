---
'block-no-verify': patch
---

Stop false "could not parse" blocks when single-quoted or escaped text holds `${…:-$(…)}`, as in `printf '%s' '${x:-$(( 1 ))}'`. The message-masking rebuild joined words without their quotes, so a later parse read the literal text as an expansion and threw `Bad substitution`. The rebuild now single-quotes only the text from the first `$` in a word (for example `SKIP=lint'$x'`), so the regex checks for `NAME=` and `core.hooksPath=` still match. An unquoted `${…:-$(…)}`, including one in a `bash -c` payload, still fails closed.
