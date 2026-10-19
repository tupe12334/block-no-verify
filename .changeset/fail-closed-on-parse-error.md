---
'block-no-verify': patch
---

Block, instead of crashing, when a command cannot be parsed (#97). An unterminated `${` made the shell tokenizer throw, and the CLI exited 1, which agents treat as non-blocking, so `git commit --no-verify -m x $(echo ${)` ran past the hooks. The hook now blocks any command it cannot check.
