---
'block-no-verify': patch
---

Block bypasses run through `su -c`, piped into a shell (`echo '…' | sh`, `printf '…' | bash`), or passed as a here-string (`sh <<< '…'`) (#101).
