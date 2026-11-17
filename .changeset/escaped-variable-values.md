---
'block-no-verify': patch
---

Resolve escaped characters in simple variable values. A variable whose value has backslash escapes, or a bare value with characters such as `=`, is now expanded with the value the shell assigns, so a flag or `core.hooksPath` setting held in such a variable is detected. The command as written is still checked too, so nothing that was blocked before is allowed now.
