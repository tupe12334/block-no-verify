---
'block-no-verify': patch
---

Check the body of each command substitution that bash runs (`$(…)` or backticks, outside single quotes) as its own command, including one inside a double-quoted commit message or PR body value. Single-quoted and escaped text stays literal and allowed.
