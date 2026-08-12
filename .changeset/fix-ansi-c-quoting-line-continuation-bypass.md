---
'block-no-verify': patch
---

Fix two tokenizer disagreements with bash that let `--no-verify` bypass detection: an ANSI-C/locale quoted flag (`$'--no-verify'`) and a line continuation splitting the flag inside a double-quoted word (`"--no-ver\` + newline + `ify"`) (#78). The input is now normalized to the form `shell-quote` already tokenizes like bash before parsing, while leaving line continuations inside single-quoted text untouched.
