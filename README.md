# block-no-verify

A platform-agnostic security tool that blocks the `--no-verify` flag in git commands. Designed to prevent AI agents from bypassing git hooks.

## Why?

When using AI coding assistants like Claude Code, Gemini CLI, Cursor, or others, you might have git hooks (pre-commit, pre-push) that enforce code quality, run tests, or perform security checks. The `--no-verify` flag allows bypassing these hooks, which could allow AI agents to skip important validations.

This package provides a CLI that can block any git commands that include `--no-verify`, working with any AI tool that supports command hooks.

## Installation

```bash
pnpm add -g block-no-verify
```

Or use without installation via `pnpm dlx block-no-verify` or `npx block-no-verify`.

## Quick Start

```bash
# Check a command directly
block-no-verify "git commit --no-verify -m 'test'"
# Exit code: 2 (blocked)

# Check a safe command
block-no-verify "git commit -m 'test'"
# Exit code: 0 (allowed)

# Pipe from stdin
echo "git push --no-verify" | block-no-verify
# Exit code: 2 (blocked)
```

## Platform Integration

### Claude Code

Add to your `.claude/settings.json`:

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

### Gemini CLI

Gemini CLI supports hooks via `.gemini/settings.json`. The hook system mirrors Claude Code's JSON-over-stdin contract and exit code semantics.

Add to your `.gemini/settings.json`:

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "run_shell_command",
        "hooks": [
          {
            "name": "block-no-verify",
            "type": "command",
            "command": "pnpm dlx block-no-verify",
            "description": "Block --no-verify flags in git commands",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

> **Note:** Hooks are disabled by default in Gemini CLI. You may need to enable them in your settings. See [Gemini CLI Hooks Documentation](https://geminicli.com/docs/hooks/) for details.

### Cursor

Cursor 1.7+ supports hooks via `.cursor/hooks.json`. The `beforeShellExecution` hook runs before any shell command.

Create `.cursor/hooks.json` in your project root:

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      {
        "command": "pnpm dlx block-no-verify --format plain"
      }
    ]
  }
}
```

> **Note:** Cursor hooks are in beta. See [Cursor Hooks Documentation](https://cursor.com/docs/agent/hooks) for the latest information.

### Generic Integration

block-no-verify accepts input in multiple formats:

```bash
# Plain text (default)
block-no-verify "git commit --no-verify"

# JSON with command field
echo '{"command":"git commit --no-verify"}' | block-no-verify

# JSON with other fields (cmd, input, shell, script)
echo '{"cmd":"git push --no-verify"}' | block-no-verify

# Claude Code format (auto-detected)
echo '{"tool_input":{"command":"git commit --no-verify"}}' | block-no-verify
```

## CLI Options

```
block-no-verify [options] [command]

Options:
  --format <type>   Input format: auto, plain, claude-code, json (default: auto)
  --help, -h        Show help message
  --version, -v     Show version

Input Methods:
  1. Command argument:  block-no-verify "git commit --no-verify"
  2. Stdin (plain):     echo "git commit --no-verify" | block-no-verify
  3. Stdin (JSON):      echo '{"command":"..."}' | block-no-verify
```

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

## Supported JSON Fields

When using JSON input (auto-detected or with `--format json`), the following fields are recognized:

| Field                | Description               |
| -------------------- | ------------------------- |
| `tool_input.command` | Claude Code format        |
| `command`            | Generic command field     |
| `cmd`                | Alternative command field |
| `input`              | Input field               |
| `shell`              | Shell command field       |
| `script`             | Script field              |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT

## References

- [Claude Code Hooks](https://docs.anthropic.com/en/docs/claude-code)
- [Gemini CLI Hooks](https://geminicli.com/docs/hooks/)
- [Cursor Hooks](https://cursor.com/docs/agent/hooks)
