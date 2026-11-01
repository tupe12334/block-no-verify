---
'block-no-verify': patch
---

Harden `core.hooksPath` override detection. Every override that the previous release blocks is still blocked. The check now also blocks an override that reaches a git command the textual check missed: a function or alias that runs git, `xargs git`, a persistent setting (`export`, `set -o` options, `eval`) with a hook run possible, and an unexported `NAME=value` with a hook run possible. No override that the previous release blocks is allowed.
