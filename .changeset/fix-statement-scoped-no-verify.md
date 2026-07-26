---
'block-no-verify': patch
---

Scope `--no-verify` flag detection to the git statement itself, instead of scanning the whole shell line. Fixes a false positive where a `-n` flag belonging to a chained command (`echo -n`, `grep -n`, `head -n`, `tail -n`, `sort -n`, ...) after `;`, `&&`, or `|` was mistaken for git's own `-n`/`--no-verify`. (#70)
