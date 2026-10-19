---
'block-no-verify': patch
---

Stop blocking commands whose commit or PR message only mentions an override (#93). The hooks-path and hook-manager env checks (`HUSKY`, `LEFTHOOK`, `SKIP`, `OVERCOMMIT_DISABLE`, `core.hooksPath`, …) now ignore the values of `-m`, `--message`, `--title`, `--body` and `--notes`. Shell payloads such as `bash -c "…"` and messages that contain a command substitution are still scanned. Also block `git "-c" "core.hooksPath=…"`, which the quoted `-c` let through before.
