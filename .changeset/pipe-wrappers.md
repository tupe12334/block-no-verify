---
'block-no-verify': patch
---

Follow scripts piped into a shell through wrappers and pass-through stages (#101): `| sudo sh`, `| env bash`, `| timeout 5 sh`, `|& sh`, `| tee x | sh`, `| cat | sh`, and `cat <<< '…' | sh`.
