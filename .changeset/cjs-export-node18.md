---
'block-no-verify': minor
---

Add a CommonJS entry point so `require('block-no-verify')` works on Node 18 and later, and fix the CLI crash on Node 18. The package now ships `dist/cjs` (built by a second `tsc` pass) and maps the `require` condition to it, while `import` and the `bin` stay ESM. The CLI loads `@polyhook/sdk` through `createRequire`, because the SDK's ESM entry cannot be parsed on Node 18. `engines.node` lowers to `>=18`, and CI now tests Node 18. This is a minor release because it adds a new consumer-facing entry point.
