---
'block-no-verify': patch
---

Fix a bypass where a hook-skipping flag inside backtick command substitution went undetected, so the guarded git command ran with hooks skipped (#80). `shell-quote` has no notion of backtick substitution and leaves the backticks glued to the adjacent words, so neither the git token nor the flag matched — the equivalent `$(...)` spelling was already caught, which made the gap easy to miss. Backtick substitution is now rewritten to `$(...)` before tokenizing, outside single quotes only and leaving a backslash-escaped backtick literal, so the statement splitter sees the operator tokens it already handles.
