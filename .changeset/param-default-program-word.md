---
'block-no-verify': patch
---

Also check a command with each `${x:-word}`, `${x-word}`, `${x:=word}`, `${x=word}`, `${x:+word}` and `${x+word}` expansion replaced by its word, so a git program name, sub-command or flag given as a parameter-expansion word is detected. The command as written is still checked first.
