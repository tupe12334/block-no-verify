---
'block-no-verify': patch
---

Check string literals in interpreter code passed on the command line (#101): `python3 -c "import os; os.system('git commit --no-verify')"`, `perl -e`, `ruby -e` and `node -e` now block.
