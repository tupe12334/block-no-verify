---
'block-no-verify': patch
---

Check the body of each command substitution that bash runs (`$(…)` or backticks, outside single quotes) as its own command, including one inside a double-quoted commit message or PR body value. Single-quoted and escaped text stays literal and allowed. Each nested command is checked once per call, and a command whose substitutions nest more than 50 levels deep or hold too much text is blocked.
