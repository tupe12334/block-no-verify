---
'block-no-verify': patch
---

<!-- cspell:ignore allexport -->

Allow a `core.hooksPath` override only where it provably cannot reach a hook run. An override that prefixes a data program (`echo`, `printf`) or a git call with a non-hook subcommand (`git status`) is text or non-hook work, so it is allowed. `GIT_CONFIG_COUNT=0` sets nothing, so it is not an override. Any other override blocks: a prefix on a function, alias, `env`, `exec`, `xargs` or any other command, an unexported `NAME=value` with a git hook run possible, and any persistent setting (`export`, `set -o allexport`, `alias`, `eval`, function definitions) with a hook run possible. `git --config-env` is no longer read as a `git config` write.
