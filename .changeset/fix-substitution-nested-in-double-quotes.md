---
'block-no-verify': patch
---

Fix a bypass where a hook-skipping flag inside a command substitution nested in double quotes went undetected, so the guarded git command ran with hooks skipped (#81). `shell-quote` returns a `$(...)` or backtick substitution written inside a quoted word as one opaque string token instead of descending into it, so neither the git token nor the flag matched (`echo "$(git commit --no-verify)"`, `echo "`git commit --no-verify`"`). The inner command of any such substitution is now extracted from the opaque token and scanned as its own statement, recursively for nested substitutions.
