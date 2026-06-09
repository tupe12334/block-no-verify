# block-no-verify

A security tool that blocks ways AI agents can bypass local git hooks. It flags the `--no-verify` flag, `core.hooksPath` overrides, and GitHub MCP tool calls that write through the GitHub API.

Powered by [`@polyhook/sdk`](https://github.com/tupe12334/polyhook) — write the hook once, run it everywhere.

## Why?

When using AI coding assistants like Claude Code, Cursor, Windsurf, Cline, or Amp, you might have git hooks (pre-commit, pre-push) that enforce code quality, run tests, or perform security checks. Agents can side-step those hooks in three common ways:

- passing `--no-verify` to a git command,
- overriding `core.hooksPath` (e.g. `git -c core.hooksPath=/dev/null ...`),
- calling GitHub MCP tools such as `mcp__github__push_files` that commit or merge directly through the GitHub API, skipping the local hook chain entirely.

This package provides a CLI that blocks all three, working with any AI tool that supports command / tool-use hooks.

## Used By

<a href="https://github.com/langgenius/dify">
  <img src="https://github.com/langgenius.png" width="50" height="50" alt="Dify" title="Dify - Open-source LLM app development platform (133k★)">
</a>
<a href="https://github.com/nicolargo/glances">
  <img src="https://github.com/nicolargo.png" width="50" height="50" alt="Glances" title="Glances - Cross-platform system monitoring tool (32k★)">
</a>
<a href="https://github.com/pubkey/rxdb">
  <img src="https://raw.githubusercontent.com/pubkey/rxdb/master/docs-src/static/files/logo/rxdb_mini.svg" width="50" height="50" alt="RxDB" title="RxDB - Local-first database for JavaScript applications (23k★)">
</a>
<a href="https://github.com/promptfoo/promptfoo">
  <img src="https://github.com/promptfoo.png" width="50" height="50" alt="Promptfoo" title="Promptfoo - LLM testing and evaluation framework (18k★)">
</a>
<a href="https://github.com/YFGaia/dify-plus">
  <img src="https://github.com/YFGaia.png" width="50" height="50" alt="Dify Plus" title="Dify Plus - Enhanced Dify distribution (2k★)">
</a>
<a href="https://github.com/forcedotcom/salesforcedx-vscode">
  <img src="https://github.com/forcedotcom.png" width="50" height="50" alt="Salesforce Extensions for VS Code" title="Salesforce Extensions for VS Code (1k★)">
</a>
<a href="https://centy.io">
  <img src="https://github.com/centy-io.png" width="50" height="50" alt="Centy" title="Centy">
</a>
<a href="https://worktree.io">
  <img src="https://github.com/worktree-io.png" width="50" height="50" alt="Worktree" title="Worktree">
</a>

## Supported Agents

| Agent                                                     | Status       |
| --------------------------------------------------------- | ------------ |
| [Claude Code](https://claude.ai/code)                     | ✅ Supported |
| [Cursor](https://cursor.com)                              | ✅ Supported |
| [Windsurf](https://windsurf.ai)                           | ✅ Supported |
| [Cline](https://github.com/cline/cline)                   | ✅ Supported |
| [Amp](https://ampcode.com)                                | ✅ Supported |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | ✅ Supported |

## Installation

Add as a dev dependency to ensure a consistent, pinned version:

```bash
pnpm add -D block-no-verify
# or
npm install --save-dev block-no-verify
```

Then use it with `pnpm exec block-no-verify` or `npm exec block-no-verify`.

## Platform Integration

### Claude Code

Add to your `.claude/settings.json`. The first matcher handles shell commands (`--no-verify`, `core.hooksPath`); the second matches any GitHub MCP tool so direct-to-API writes are also blocked:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm exec block-no-verify"
          }
        ]
      },
      {
        "matcher": "mcp__github__.*",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm exec block-no-verify"
          }
        ]
      }
    ]
  }
}
```

### Cursor

Cursor 1.7+ supports hooks via `.cursor/hooks.json`. The `beforeShellExecution` hook runs before any shell command.

Create `.cursor/hooks.json` in your project root:

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      {
        "command": "pnpm exec block-no-verify"
      }
    ]
  }
}
```

> **Note:** Cursor hooks are in beta. See [Cursor Hooks Documentation](https://cursor.com/docs/agent/hooks) for the latest information.

### Windsurf

Add to your `.windsurf/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm exec block-no-verify"
          }
        ]
      }
    ]
  }
}
```

### Gemini CLI

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
            "command": "pnpm exec block-no-verify",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

> **Note:** Hooks are disabled by default in Gemini CLI. See [Gemini CLI Hooks Documentation](https://geminicli.com/docs/hooks/) for details.

## Supported Git Commands

The following git commands are monitored for `--no-verify`:

- `git commit`
- `git push`
- `git merge`
- `git cherry-pick`
- `git rebase`
- `git am`

## Blocked GitHub MCP Tools

The following GitHub MCP tools are blocked because they write through the GitHub API and therefore skip local git hooks:

- `mcp__github__create_or_update_file`
- `mcp__github__delete_file`
- `mcp__github__push_files`
- `mcp__github__merge_pull_request`
- `mcp__github__update_pull_request_branch`

Read-only GitHub MCP tools (e.g. `mcp__github__get_file_contents`, `mcp__github__list_pull_requests`) are not blocked.

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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT

## References

- [polyhook SDK](https://github.com/tupe12334/polyhook)
- [Claude Code Hooks](https://docs.anthropic.com/en/docs/claude-code)
- [Gemini CLI Hooks](https://geminicli.com/docs/hooks/)
- [Cursor Hooks](https://cursor.com/docs/agent/hooks)
