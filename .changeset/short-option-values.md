---
'block-no-verify': patch
---

Fix false positives on `git commit` short-option bundles. A bundled token such as `-tn`, `-uno` or `-S` followed by a key id no longer reads its trailing `n` as the `-n` (`--no-verify`) flag, because `-t` (template), `-u` (untracked-files) and `-S` (gpg-sign) take their value from the rest of the token. `-t` and `--template` also skip their separate value token. Real bypasses such as `-n`, `-qn`, `-nq`, `-an` and `-n -m x` stay blocked.
