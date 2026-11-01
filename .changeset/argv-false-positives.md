---
'block-no-verify': patch
---

Stop blocking `git commit` when a short bundle ends in a value option (`-am "--no-verify"`), and when a redirect target looks like a flag (`> --no-verify`).
