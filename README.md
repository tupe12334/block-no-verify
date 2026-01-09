# block-no-verify

A security tool that blocks the `--no-verify` flag in git commands. Designed to prevent AI agents from bypassing git hooks.

## Why?

When using AI coding assistants like Claude Code, you might have git hooks (pre-commit, pre-push) that enforce code quality, run tests, or perform security checks. The `--no-verify` flag allows bypassing these hooks, which could allow AI agents to skip important validations.

This package provides a CLI that can be used as a Claude Code hook to block any git commands that include `--no-verify`.

## Installation

```bash
npm install -g block-no-verify
# or
pnpm add -g block-no-verify
```

## Usage with Claude Code

### Without Installation (Recommended)

You can use the package directly without installing it globally:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm dlx block-no-verify"
          }
        ]
      }
    ]
  }
}
```

Or with npx:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "npx block-no-verify"
          }
        ]
      }
    ]
  }
}
```

### With Global Installation

If you installed the package globally, add this to your `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "block-no-verify"
          }
        ]
      }
    ]
  }
}
```

This will block any Bash commands that contain `--no-verify` with supported git commands.

## Supported Git Commands

The following git commands are monitored for `--no-verify`:

- `git commit`
- `git push`
- `git merge`
- `git cherry-pick`
- `git rebase`
- `git am`

## Behavior

| Command                  | Blocked? | Notes                                         |
| ------------------------ | -------- | --------------------------------------------- |
| `git commit --no-verify` | Yes      |                                               |
| `git commit -n`          | Yes      | `-n` is shorthand for `--no-verify` in commit |
| `git push --no-verify`   | Yes      |                                               |
| `git push -n`            | No       | `-n` means `--dry-run` in push                |
| `git merge --no-verify`  | Yes      |                                               |
| `git merge -n`           | No       | `-n` means `--no-commit` in merge             |
| `git commit -m "msg"`    | No       | No `--no-verify` flag                         |

## Exit Codes

- `0` - Command is allowed
- `2` - Command is blocked (contains `--no-verify`)
- `1` - An error occurred

## Programmatic Usage

```typescript
import {
  checkCommand,
  detectGitCommand,
  hasNoVerifyFlag,
} from 'block-no-verify'

// Check if a command should be blocked
const result = checkCommand('git commit --no-verify -m "test"')
console.log(result.blocked) // true
console.log(result.reason) // "BLOCKED: --no-verify flag is not allowed..."

// Detect git command type
const cmd = detectGitCommand('git push origin main')
console.log(cmd) // "push"

// Check for no-verify flag
const hasFlag = hasNoVerifyFlag('git commit -n -m "test"', 'commit')
console.log(hasFlag) // true
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint
pnpm lint

# Format
pnpm format
```

## License

MIT
