/**
 * CLI help text
 */
export const HELP_TEXT = `block-no-verify - Block ways to bypass local git hooks

Blocks --no-verify flags, core.hooksPath overrides, and GitHub MCP tool calls
that write through the GitHub API (e.g. mcp__github__push_files).

USAGE:
  block-no-verify [options] [command]

OPTIONS:
  --format <type>   Input format: auto, plain, claude-code, json (default: auto)
  --help, -h        Show this help message
  --version, -v     Show version number

INPUT METHODS:
  1. Command argument:
     block-no-verify "git commit --no-verify -m 'test'"

  2. Stdin (plain text):
     echo "git commit --no-verify" | block-no-verify

  3. Stdin (JSON - auto-detected):
     echo '{"command":"git commit --no-verify"}' | block-no-verify

  4. Stdin (Claude Code format):
     echo '{"tool_input":{"command":"git commit"}}' | block-no-verify --format claude-code

SUPPORTED JSON FIELDS:
  When using JSON input, the following fields are recognized:
  - tool_input.command  (Claude Code format)
  - command
  - cmd
  - input
  - shell
  - script

EXIT CODES:
  0 - Command / tool call is allowed
  2 - Command / tool call is blocked (bypasses git hooks)
  1 - An error occurred

EXAMPLES:
  # Claude Code hook (.claude/settings.json)
  {
    "hooks": {
      "PreToolUse": [{
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "block-no-verify" }]
      }]
    }
  }

  # Cursor hook (.cursor/hooks.json)
  {
    "hooks": {
      "beforeShellExecution": [{
        "command": "pnpm dlx block-no-verify"
      }]
    }
  }

  # Generic AI tool integration
  block-no-verify --format plain "git push --no-verify"

  # Pipe from another command
  your-ai-tool get-command | block-no-verify`
