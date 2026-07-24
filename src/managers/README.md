# managers

Tool-specific bypass detection lives here. Each subfolder targets one tool
that can disable git hooks in its own way (separate from generic git flags
like `--no-verify` or `core.hooksPath`, which live in `src/`).

- `husky/` — detects the `HUSKY=0` environment override.
- `lefthook/` — detects the `LEFTHOOK=0` environment override.
- `overcommit/` — detects the `OVERCOMMIT_DISABLE=1` environment override.
- `pre-commit/` — detects a non-empty `SKIP=` environment override.

To add a new tool, create a subfolder with its detector + spec, then wire the
detector into `src/check-command.ts` and export it from `src/index.ts`.
