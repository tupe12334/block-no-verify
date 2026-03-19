# Changelog

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
