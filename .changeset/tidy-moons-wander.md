---
'block-no-verify': patch
---

Stop blocking commands that only mention the hooks-path key and the word `config`

The hooks-path check tested `config` and the key as two independent matches over
the whole command, and accepted a plain space as the assignment, so scattered
prose such as `echo 'core.hooksPath via -c and git config'` was rejected even
though it sets nothing and runs no git. `git config --get core.hooksPath && echo
done` was blocked for the same reason: `&` matched as the value.

A `config` call must now reach the key through option words only, and a value
that starts a new statement is treated as absent. An explicit
`core.hooksPath=<value>` assignment still blocks wherever it appears.
