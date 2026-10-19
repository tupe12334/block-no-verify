---
'block-no-verify': patch
---

Block git aliases that carry a hook bypass (#91). `git -c alias.ci="commit --no-verify" ci` and `git config alias.ci "commit --no-verify"` were allowed because the alias name is not a guarded sub-command. Each alias defined in a command (via `-c alias.NAME=VALUE` or `git config alias.NAME VALUE`) is now checked as the command it runs: `git VALUE`, or the shell command for a `!` alias.
