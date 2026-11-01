---
'block-no-verify': patch
---

Stop blocking git commands whose `--no-verify` text is not a flag. A `-m` value that ends a short bundle (`-am "--no-verify"`), words after `--`, and redirect file names (`> --no-verify`) are no longer read as flags.
