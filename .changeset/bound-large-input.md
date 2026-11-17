---
'block-no-verify': patch
---

Bound check time on very large commands. Commands with many variable assignments, many `git` commands, or many heredocs on one line are now checked in linear time instead of quadratic time. A command longer than 100,000 characters, or one whose checks would still do too much work (a variable expansion that grows past that length, or one statement with very many `git` words), is blocked with the "could not check this command" reason. A PR body of 65,536 characters stays allowed.
