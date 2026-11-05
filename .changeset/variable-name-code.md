---
'block-no-verify': patch
---

Block hook bypasses that bash runs through variable names: a `$(…)` in a `printf -v` array subscript, and later commands after a write to `BASH_CMDS` or `BASH_ALIASES` (#152).
