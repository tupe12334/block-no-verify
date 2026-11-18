---
'block-no-verify': patch
---

Stop blocking a long one-line commit message or PR body because it has many `git` words. Such a command is now checked with its quoted message text left out, so the rest of the command is still checked.
