import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// Built at runtime so the source never holds a literal bypass command.
const NV = '--no-' + 'verify'

const cliPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../dist/cli.js'
)

const BUILD_REQUIRED = "dist/cli.js not found — run 'pnpm build' first"

function cliBlocks(command: string): boolean {
  if (!existsSync(cliPath)) {
    throw new Error(BUILD_REQUIRED)
  }
  const result = spawnSync('node', [cliPath], {
    input: JSON.stringify({
      hook_event_name: 'PreToolUse',
      tool_name: 'Bash',
      tool_input: { command },
    }),
  })
  return result.status === 2
}

// Each option here takes no value for this sub-command (`-m` is `--merge`
// for rebase and `--message-id` for am, `-c` is `--scissors` for am,
// `--squash` is a switch for merge, and push has no `-m`), so the next
// token is a flag.
const blocked = [
  `git rebase -m "${NV}" main`,
  `git rebase -m ${NV} main`,
  `git rebase -m ${NV} commit`,
  `git merge --squash ${NV} feature`,
  `git am -m ${NV} fix.patch`,
  `git am -c ${NV} fix.patch`,
  `git am --message ${NV} fix.patch`,
  `git push -m ${NV} origin main`,
]

// The token after a message or parent-number option is its value.
const allowed = [
  `git commit -m "${NV} is mentioned"`,
  `git commit -m "${NV}"`,
  'git merge -m "msg" feature',
  `git merge -m "${NV}" feature`,
  'git cherry-pick -m 1 abc',
  'git rebase -C 3 main',
]

describe('checkCommand: value options per sub-command', () => {
  it.each(blocked)('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it.each(allowed)('allows %s', command => {
    expect(checkCommand(command).blocked).toBe(false)
  })
})

describe('CLI: value options per sub-command', () => {
  it.each(blocked)('blocks %s', command => {
    expect(cliBlocks(command)).toBe(true)
  })

  it.each(allowed)('allows %s', command => {
    expect(cliBlocks(command)).toBe(false)
  })
})
