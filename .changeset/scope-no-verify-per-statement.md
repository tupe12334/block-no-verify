---
'block-no-verify': patch
---

Scope `--no-verify`/`-n` detection to the shell statement that invokes the guarded git command, so a `-n` belonging to a chained `echo`, `grep`, or `head` no longer blocks `git commit` (#70). Statement splitting works on `shell-quote` operator tokens, so separators inside quoted commit messages cannot hide a real bypass.
