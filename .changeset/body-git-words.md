---
'block-no-verify': patch
---

Stop blocking a long one-line commit message or PR body because it has many `git` words. A `git` word inside a quoted `-m`, `--message`, `--title`, `--body` or `--notes` value of a `git` or `gh` command no longer counts toward the parse limit, because the shell never runs that text. This applies only where message values are masked: the value is one quoted part with no command substitution, and the command has no `#`, `alias`, heredoc, `$'…'` or `$"…"` quoting, or unquoted newline. Elsewhere each `git` word still counts, and a statement with too many of them is still blocked with the "could not check this command" reason. Since 1.4.5, `detectGitCommand`, `hasNoVerifyFlag` and `hasHooksPathOverride` throw an `InputTooLongError` when their input is too large to check; their docs now say so. `checkCommand` blocks such input and does not throw.
