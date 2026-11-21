---
'block-no-verify': patch
---

Stop blocking commands that only mention the word `config` and the hooks-path key in separate places (`echo 'core.hooksPath via -c and git config'`). The two are now matched in one ordered pattern, so they must belong to the same statement with `config` first.
