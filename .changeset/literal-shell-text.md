---
'block-no-verify': patch
---

Keep checking text that a shell can run. A heredoc body fed to a shell (`bash <<EOF`, `sh -s <<EOF`) is checked, and so is a quoted-delimiter body whose line is not a plain `cat` (`cat <<\EOF | bash`, `tee s.sh <<\EOF`, `source /dev/stdin <<\EOF`). A quoted `cat` body is dropped as data only when the whole input is that plain read, with no substitution, pipe, list operator, grouping or other redirect. Unquoted bodies keep their `$(` and backtick lines. Single-quoted or escaped `$(` and backticks are neutralized only in a line that is one `echo`, `printf` or `cat` statement, so text that reaches `bash -c`, `eval`, `source` or a pipe is still checked. Several heredoc bodies opened on one line are read in order, and `<<<` is not a heredoc.
