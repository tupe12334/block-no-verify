import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// Built at runtime so the source never holds a literal bypass command.
const NV = '--no-' + 'verify'
const ESCAPED_NV = '--no' + '\\-' + 'verify'
const HOOKS = 'core.hooks' + 'Path'

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

// Outside quotes bash drops the backslash of an escaped character, so the
// variable holds the plain flag when the command runs.
const blocked = [
  `f=${ESCAPED_NV}; git commit $f`,
  `f=--no-ver\\ify; git commit $f`,
  `f=\\-\\-no\\-verify; git commit $f`,
  `f=-\\n; git commit -m x $f`,
  `f=${ESCAPED_NV}; git push $` + '{f}',
  `export f=${ESCAPED_NV}; git commit $f`,
  `f=${ESCAPED_NV}\ngit commit $f`,
  `f=${ESCAPED_NV} g=x; git commit $f`,
  `f="a\\" ${NV}"; git commit $f`,
  `f=--no''-verify; git commit $f`,
  `f=--no""-verify; git commit $f`,
  `f=--no'-'"ver"ify; git commit $f`,
  `f=--no\\-veri; git commit $f`,
  `f=${HOOKS}=/dev/null; git -c $f commit -m x`,
  `f=${HOOKS}\\=/dev/null; git -c $f commit -m x`,
  `f=core.hooks\\Path=/dev/null; git -c $f commit -m x`,
  `export f=core.hooks\\Path=/dev/null; git -c $f commit -m x`,
]

const allowed = [
  'f=a\\ b; echo $f',
  'f=a\\ b; git commit -m $f',
  'f=x\\;y; git status $f',
  'f=\\-m; git commit $f x',
  "f='a\\-b'; git commit -m $f",
  'f="a\\\\b"; echo $f',
  'f="a\\"b"; git commit -m $f',
  'git commit -m "f=a\\-b"',
  'f=--no\\-edit; git commit --amend $f',
  "f=a''b; echo $f",
  "f=--no''-edit; git commit --amend $f",
  'f=a"$x"b; git commit -m $f',
]

describe('checkCommand: escaped assignment values', () => {
  it.each(blocked)('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it.each(allowed)('allows %s', command => {
    expect(checkCommand(command).blocked).toBe(false)
  })
})

describe('CLI: escaped assignment values', () => {
  it.each(blocked)('blocks %s', command => {
    expect(cliBlocks(command)).toBe(true)
  })

  it.each(allowed)('allows %s', command => {
    expect(cliBlocks(command)).toBe(false)
  })
})
