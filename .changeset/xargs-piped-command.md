---
'block-no-verify': patch
---

Fix a bypass where text piped into `xargs` ran a hook-skipping command undetected, so the commit went through a failing pre-commit hook (`echo 'git commit -q -m x --no-verify' | xargs -I{} bash -c '{}'`). xargs runs its command with the piped lines as arguments, but the scan only checked the shell's own operand, which was the replace string `{}`. The piped text is now combined with xargs' command the way xargs does it (in place of `-I{}`/`-i`/`--replace`, or appended), and that command is checked like a typed one. Options such as `-n`, `-0` and `-r` are read, and `echo a | xargs grep -n foo` stays allowed.
