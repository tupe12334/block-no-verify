---
'block-no-verify': patch
---

Block hook bypasses wrapped in a shell `-c` string (#101). `bash -c "git commit --no-verify -m x"` was allowed because the quoted operand was never checked as a command. The `-c` operand of `sh`, `bash`, `zsh`, `dash` and `ksh` (also in bundles such as `-lc` and `-ec`) is now checked like a typed command, including when nested or used inside a `!` git alias.
