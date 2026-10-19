---
'block-no-verify': patch
---

Block hook bypasses run through `eval` or `env -S` (#101). `eval "git commit --no-verify -m x"` and `env -S "git commit --no-verify"` were allowed. The command line that `eval` builds from its arguments, and the value of `env -S` / `--split-string`, are now checked like typed commands.
