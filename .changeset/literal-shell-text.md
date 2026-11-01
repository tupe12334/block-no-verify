---
'block-no-verify': patch
---

Fix false positives on text that bash never runs. A `$(` or backtick inside single quotes, or escaped with a backslash, is no longer checked as a command substitution (`printf '%s' '$(git push --no-verify)'`, `echo "\$(git push --no-verify)"`, `echo $'$(git push --no-verify)'`). A heredoc with a quoted delimiter (`<<'EOF'`, `<<\EOF`) is data, and `<<\EOF` is now recognized. Unquoted heredoc bodies still run `$(` and backticks, so those lines stay checked. Several heredoc bodies opened on one line are read in order, and a here-string `<<<` is no longer taken for a heredoc. A body fed to a shell that runs it (`bash <<EOF`, `sh -s <<EOF`) is now checked, so `bash <<EOF` with a `git commit --no-verify` line blocks.
