---
'block-no-verify': patch
---

Block git aliases that carry a hook bypass (#91). `git -c alias.ci="commit --no-verify" ci` and `git config alias.ci "commit --no-verify"` were allowed because the alias name is not a guarded sub-command. Each alias defined in a command (via `-c alias.NAME=VALUE` or `git config alias.NAME VALUE`) is now checked as the command it runs: `git VALUE`, or the shell command for a `!` alias.

A persisted alias called with the short `-n` flag (`git ci -n`) is not blocked, because `-n` means something else for most git commands and the alias definition is not visible. `--no-verify` after a sub-command that is not a git built-in is blocked, since that sub-command may be an alias.

The built-in list comes from git 2.50, so on an older git an alias persisted under a newer built-in's name (for example `replay`) is not covered by that rule.
