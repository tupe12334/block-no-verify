---
'block-no-verify': patch
---

Block `core.hooksPath` overrides written in any letter case (#91). Git config keys are case-insensitive, so `git -c core.hookspath=/dev/null commit` skipped hooks while only the camel-case spelling was detected. All four hooks-path checks (`-c`, `GIT_CONFIG_KEY_<n>`, `GIT_CONFIG_PARAMETERS`, `git config`) now match case-insensitively.
