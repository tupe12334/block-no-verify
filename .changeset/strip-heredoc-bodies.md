---
'block-no-verify': patch
---

Strip heredoc bodies from the input before scanning for `--no-verify`, so a `-n`/`--no-verify`-looking flag written inside a heredoc's free-form text (e.g. an example `grep -n` in a doc block) is no longer mistaken for a real flag on a statement it has nothing to do with (#89).
