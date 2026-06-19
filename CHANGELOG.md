# Changelog

## [1.3.0](https://github.com/tupe12334/block-no-verify/compare/v1.2.0...v1.3.0) (2026-06-18)

### Features

- block HUSKY=0 environment override ([#3](https://github.com/tupe12334/block-no-verify/issues/3)) ([#10](https://github.com/tupe12334/block-no-verify/issues/10)) ([3074db3](https://github.com/tupe12334/block-no-verify/commit/3074db3bafd6589933571b22c32ad3db05a310eb))
- tell agent to report false positives in block message ([#8](https://github.com/tupe12334/block-no-verify/issues/8)) ([33f760b](https://github.com/tupe12334/block-no-verify/commit/33f760b66e0a1bb4fab009fe522d85ae9d8dc70f)), closes [#7](https://github.com/tupe12334/block-no-verify/issues/7)

### Bug Fixes

- actually block bypass attempts in Claude Code hooks ([#29](https://github.com/tupe12334/block-no-verify/issues/29)) ([#30](https://github.com/tupe12334/block-no-verify/issues/30)) ([3d5cb04](https://github.com/tupe12334/block-no-verify/commit/3d5cb0403db15c3ffe56a6692b413eeefd0c9c10))
- stop scanning commit message bodies for bypass flags ([#26](https://github.com/tupe12334/block-no-verify/issues/26)) ([1384aa1](https://github.com/tupe12334/block-no-verify/commit/1384aa13421019d6db05a939edab1925621a1b5e)), closes [#1](https://github.com/tupe12334/block-no-verify/issues/1) [#5](https://github.com/tupe12334/block-no-verify/issues/5) [#9](https://github.com/tupe12334/block-no-verify/issues/9)

## [1.2.0](https://github.com/tupe12334/block-no-verify/compare/v1.1.5...v1.2.0) (2026-06-02)

### Features

- replace custom stdin parsing with @polyhook/sdk ([#4](https://github.com/tupe12334/block-no-verify/issues/4)) ([b4b2610](https://github.com/tupe12334/block-no-verify/commit/b4b261065aa962af8f03e40e623f856cb333fe49)), closes [#5](https://github.com/tupe12334/block-no-verify/issues/5)

## [1.1.5](https://github.com/tupe12334/block-no-verify/compare/v1.1.4...v1.1.5) (2026-04-16)

### Features

- block GitHub MCP tools that bypass local git hooks ([#2](https://github.com/tupe12334/block-no-verify/issues/2)) ([7323a7c](https://github.com/tupe12334/block-no-verify/commit/7323a7c75d3c0529ff3ea866bf0fe705eda5152c))

## 1.1.4 (2026-03-24)

### Features

- add .local to .gitignore for temporary file exclusion ([0f9d15a](https://github.com/tupe12334/block-no-verify/commit/0f9d15a1a7ceecfccc6f65b1a50f7ff39a9dbdd1))
- add additional Bash commands for improved functionality in settings ([f8ccb8e](https://github.com/tupe12334/block-no-verify/commit/f8ccb8e69ca12b9781b4c8129af75be2ae6b31c5))
- add agent-specific test suite with shared test commands ([daad1ff](https://github.com/tupe12334/block-no-verify/commit/daad1ffad9244aba2fc68f1e36390a9a26f88013))
- Add commands for intelligent session revert, chat summary, deep analysis, use case testing, and comprehensive feature validation ([e385db6](https://github.com/tupe12334/block-no-verify/commit/e385db649ae11199d4651d2aee18bfbc9742cb6a))
- add comprehensive edge case detection for git commands ([e1ee029](https://github.com/tupe12334/block-no-verify/commit/e1ee0298e0d1d83b337595a54b70f237bbdbf832))
- Add CONTRIBUTING.md and README.md for project guidelines and usage instructions ([895f658](https://github.com/tupe12334/block-no-verify/commit/895f65838e8981fe74d7851589a173db5ccfb995))
- Add eslint-import-resolver-typescript to enhance ESLint configuration ([53a4a77](https://github.com/tupe12334/block-no-verify/commit/53a4a77c63b1302b4e35ed21ccc6ad34664a8227))
- add GitHub CLI commands to permissions in settings ([149dfbe](https://github.com/tupe12334/block-no-verify/commit/149dfbe2f59ae386ab8e43ea915d3dfdf3427b45))
- Add LICENSE, ESLint, and Knip configuration files ([e5889d3](https://github.com/tupe12334/block-no-verify/commit/e5889d346434e880b392fb3d30f9175b87d73ce3))
- add pattern to ignore additional local temporary files ([73aedcd](https://github.com/tupe12334/block-no-verify/commit/73aedcdcbe16329514a8d0c39ae34dbc31bd0fe3))
- add permission for pnpm test command in settings ([1d347f0](https://github.com/tupe12334/block-no-verify/commit/1d347f0e9998a89d9f7b88446b6c5be23629357f))
- add platform-agnostic support for Claude Code, Gemini CLI, and Cursor ([b8e8fc4](https://github.com/tupe12334/block-no-verify/commit/b8e8fc432bffea618ff1ed0e709f87b769e5ff52))
- Add Prettier and Commitlint configuration files ([a7ba725](https://github.com/tupe12334/block-no-verify/commit/a7ba7255fe214fd1ef09a17955f1574b34466346))
- add settings for block-no-verify hook to prevent --no-verify flags in git commands ([8546e60](https://github.com/tupe12334/block-no-verify/commit/8546e60f028571bfbe78c780fe9813173156dc9a))
- Add settings for permissions and hooks to block --no-verify on git push ([e809415](https://github.com/tupe12334/block-no-verify/commit/e809415dc318ea4d15fa4cf3999c59ca7cf5f193))
- add shell syntax edge case detection and tests ([4d52d79](https://github.com/tupe12334/block-no-verify/commit/4d52d79179dfca8ff7919dc60cb15a6e059160e7))
- add wc command to permissions in settings ([2691f77](https://github.com/tupe12334/block-no-verify/commit/2691f776515d299ec8445f8600cdb88f9a6bd6a6))
- block core.hooksPath override to prevent hook bypass ([f7a2df0](https://github.com/tupe12334/block-no-verify/commit/f7a2df03c92975a045ef683a3a00603d469f0275))
- bump version to 1.1.2 ([785fbf1](https://github.com/tupe12334/block-no-verify/commit/785fbf1a5b18e177773921be8526810771f8734c))
- implement block-no-verify CLI tool with comprehensive test suite ([5c05c1e](https://github.com/tupe12334/block-no-verify/commit/5c05c1ea10001e2ad82838f46f48022073cac6a7))
- Update .gitignore to include additional temporary files and IDE configurations ([7774def](https://github.com/tupe12334/block-no-verify/commit/7774def2efb7d35091c09449497d2418e5b6d878))
- update usage instructions for non-global installation with pnpm and npx ([18100d8](https://github.com/tupe12334/block-no-verify/commit/18100d81f7b2b54e23d2504d2430a337ea932f91))

### Bug Fixes

- **ci:** run build before tests to ensure dist/cli.js exists ([5539896](https://github.com/tupe12334/block-no-verify/commit/55398968ffb954ca0e3c4406b0252334a2469695))
- update command in hooks to use pnpm dlx for block-no-verify ([00e68d7](https://github.com/tupe12334/block-no-verify/commit/00e68d78494fc0abe152731fa692d2d542318cdb))
- update installation instructions to remove npm and npx references ([93312e3](https://github.com/tupe12334/block-no-verify/commit/93312e3aa7d70b8698ebe9e8c7500597b1d3d371))

All notable changes to this project will be documented in this file.

## [1.1.2] - 2025-05-13

### Features

- Block `core.hooksPath` override to prevent hook bypass
- Add platform-agnostic support for Claude Code, Gemini CLI, and Cursor
- Add comprehensive edge case detection for git commands
- Add shell syntax edge case detection and tests
- Add agent-specific test suite with shared test commands

### Bug Fixes

- Update command in hooks to use `pnpm dlx` for block-no-verify

## [1.0.0] - 2025-05-01

### Features

- Implement block-no-verify CLI tool with comprehensive test suite
- Add settings for block-no-verify hook to prevent `--no-verify` flags in git commands

### Bug Fixes

- Run build before tests to ensure `dist/cli.js` exists (CI)
