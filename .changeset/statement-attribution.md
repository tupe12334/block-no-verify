---
'block-no-verify': patch
---

Fix false positives where a `--no-verify` flag was blamed on a git call in another statement. An unquoted newline now ends a statement, so `git commit -m x` followed by `bash -n s.sh` on the next line no longer marks `-n` as a commit flag. Data statements (`echo`, `printf`, `cat`, `tee`, `grep`, assignments such as `old="git commit"`) and `command -v`/`-V` lookups are no longer scanned for flags, and `printf '%s' eval '…'` no longer starts a shell scan. Process substitution `<(…)` now starts its own statement. Real bypasses such as `eval 'git commit --no-verify'`, `echo ok` then `git commit -n` on the next line, and `cat <(git push --no-verify)` stay blocked.
