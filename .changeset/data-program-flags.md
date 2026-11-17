---
'block-no-verify': patch
---

Stop blocking a command line whose only programs print or search text (`echo`, `printf`, `cat`, `tee`, `grep`, or `xargs -n 1 echo`) when git text appears as their data and one of them takes `-n`, as in `echo "git commit -m x" | grep -n commit`. No git runs on such a line. A line with a `$` expansion or a backtick (even quoted), a line continuation, `printf -v`, a subshell, a function, a second line, or any other program is checked as before.
