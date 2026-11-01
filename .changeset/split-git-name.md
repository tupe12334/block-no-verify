---
'block-no-verify': patch
---

Detect a git name that shell quoting or escaping splits, such as `g''it commit --no-verify`, `g\it commit --no-verify`, and a `g\` line continuation before `it`. The raw-text scan could not see these, so `--no-verify` ran past a failing pre-commit hook. Detection now also compares the shell-unquoted words, reusing the existing `tokenizeCommand` helper, when the raw scan finds nothing.
