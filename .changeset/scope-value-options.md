---
'block-no-verify': patch
---

Scope value options to the subcommands that take them. The token after an option such as `-m`, `-c` or `--squash` is now skipped as a value only for a git subcommand where that option takes a value, so for example the token after `git rebase -m` (`--merge`) is checked. Nothing that was blocked before is allowed now.
