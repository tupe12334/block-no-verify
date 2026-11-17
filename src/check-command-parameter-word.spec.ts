import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// Built at runtime so the source never holds a literal bypass command.
const NV = '--no-' + 'verify'
const param = (op: string, word: string): string => '$' + `{x${op}${word}}`

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

// A parameter expansion with a default, assign or alternate word expands to
// that word, so bash can run it as the program: `${x:-git}` is `git` when x
// is unset.
const blocked = [
  `${param(':-', 'git')} commit -n -m x`,
  `${param('-', 'git')} commit -n -m x`,
  `${param(':=', 'git')} commit -n -m x`,
  `${param('=', 'git')} commit -n -m x`,
  `${param(':+', 'git')} commit -n -m x`,
  `${param('+', 'git')} commit -n -m x`,
  `"${param(':-', 'git')}" commit -n -m x`,
  `${param(':-', 'g')}it commit -n -m x`,
  `${param(':-', param(':-', 'git'))} commit -n -m x`,
  `${param(':-', 'git')} push ${NV}`,
  `git ${param(':-', 'commit')} -n -m x`,
  `git commit ${param(':-', '-n')} -m x`,
  `bash -c '${param(':-', 'git')} commit -n -m x'`,
  `echo $(${param(':-', 'git')} commit -n -m x)`,
  `eval '${param(':-', 'git')} commit -n -m x'`,
  // An empty word stays as written, so it fails closed as before.
  ...[':-', '-', ':=', '=', ':+', '+'].map(
    op => `git ${param(op, '')} ${NV} -m x`
  ),
  `git "${param(':-', '')}" ${NV} -m x`,
]

const allowed = [
  `echo ${param(':-', 'git')}`,
  `printf '%s' '${param(':-', 'git')} commit -n'`,
  `${param(':-', 'ls')} -la`,
  `${param(':-', 'git')} commit -m ok`,
  `git commit -m "${param(':-', 'msg')}"`,
  // An unknown program name stays allowed, as for any unset variable.
  '$x commit -n -m x',
]

describe('checkCommand: parameter expansion words', () => {
  it.each(blocked)('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it.each(allowed)('allows %s', command => {
    expect(checkCommand(command).blocked).toBe(false)
  })
})

describe('CLI: parameter expansion words', () => {
  it.each(blocked)('blocks %s', command => {
    expect(cliBlocks(command)).toBe(true)
  })

  it.each(allowed)('allows %s', command => {
    expect(cliBlocks(command)).toBe(false)
  })
})
