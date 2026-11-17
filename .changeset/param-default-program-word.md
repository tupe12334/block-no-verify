---
'block-no-verify': patch
---

Resolve `${x:-word}`, `${x-word}`, `${x:=word}`, `${x=word}`, `${x:+word}` and `${x+word}` to their word before the checks run, so a git program name, sub-command or flag given as a parameter-expansion word is detected.
