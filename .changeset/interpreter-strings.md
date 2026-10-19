---
'block-no-verify': patch
---

Check string literals in interpreter code passed on the command line (#101): `python3 -c "import os; os.system('git commit --no-verify')"`, `perl -e`, `ruby -e` and `node -e` now block.

Code whose literals only name git and the flag separately (for example `print("git"); print("--no-verify")`) can be blocked too, because argv-list literals are also checked joined. Perl/Ruby `q{}`-style quoting and code fed on stdin are not covered yet.
