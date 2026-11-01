---
'block-no-verify': patch
---

Keep checking `$(…)` and backtick substitutions in an `echo`/`printf`/`cat` statement that also uses ANSI-C quoting (`$'…'`). The quoting rewrite does not expand ANSI-C escapes, so `$'\''` (one literal quote character) looked like a quote mark, and a live substitution between two of them was treated as text. bash runs that substitution, so `echo $'\'' $(git commit … --no-verify) $'\''` committed past the hooks. Literal-substitution neutralization is now skipped whenever ANSI-C or locale quoting is present.
