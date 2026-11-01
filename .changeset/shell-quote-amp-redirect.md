---
'block-no-verify': patch
---

Require `shell-quote` 1.12.0 or later. Earlier versions split the `&>` and `&>>` redirects into a background `&` and a `>`, so a skip flag written after the redirect file (`git commit -m x &> out -n`) was read as part of a new statement without git and the command was allowed. bash passes those words to git, so the commit skipped its hooks. Installs that resolved `shell-quote` 1.9 to 1.11 were affected.
