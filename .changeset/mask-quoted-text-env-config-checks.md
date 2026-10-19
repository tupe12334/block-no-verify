---
'block-no-verify': patch
---

Stop blocking commands whose quoted free text only mentions an override (#93). The hooks-path and hook-manager env checks (`HUSKY`, `LEFTHOOK`, `SKIP`, `OVERCOMMIT_DISABLE`, `core.hooksPath`, …) now scan the command with whitespace-bearing quoted text, such as a commit message or PR body, masked. Real overrides, including quoted single-word values and `key=value` assignments that contain spaces, are still blocked.
