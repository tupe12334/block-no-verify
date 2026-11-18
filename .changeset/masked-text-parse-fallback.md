---
'block-no-verify': patch
---

Stop blocking a command as one that cannot be parsed when its single-quoted text holds a `${…}` with a space or parenthesis (`grep -rn '${JSON.stringify(' src`). The message-masked copy of the command loses its quotes, so that text became a bad substitution. When the copy does not parse, `$` and `\` in it are now escaped, which keeps the quote-free form that the override checks read.
