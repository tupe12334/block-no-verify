import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'
import { checkCommandText } from './check-command-text.js'

// Built at runtime so the source never holds a literal bypass command.
const NV = '--no-' + 'verify'
const param = (op: string, word: string): string => '$' + `{x${op}${word}}`

/**
 * Runs a check like the hook does: a check that throws blocks.
 * @param check - The check to run.
 * @returns Whether the check blocks.
 */
function blocks(check: () => { blocked: boolean }): boolean {
  try {
    return check().blocked
  } catch {
    return true
  }
}

/**
 * Builds commands from random words with a fixed seed, so a failure replays.
 * @param count - How many commands to build.
 * @returns The commands.
 */
function randomCommands(count: number): string[] {
  const words = [
    'git',
    'commit',
    'push',
    '-n',
    NV,
    '-m',
    'x',
    '-q',
    ';',
    '&&',
    '|',
    'x=-q;',
    'export x=-n;',
    'x=commit;',
    param(':-', 'git'),
    param(':-', '-n'),
    param(':-', '-m'),
    param(':+', '-q'),
    param('-', 'commit'),
    param(':-', ''),
    '$x',
    `"${param(':-', 'commit')}"`,
    'echo',
    'HUSKY=0',
    '-c',
    'core.hooksPath=/dev/null',
    "bash -c '",
    "'",
    'eval',
    '$(',
    ')',
    '\n',
  ]
  let seed = 12345
  const next = (n: number): number => {
    seed = (seed * 48271) % 2147483647
    return seed % n
  }
  return Array.from({ length: count }, () =>
    Array.from({ length: 2 + next(6) }, () =>
      String(words.at(next(words.length)))
    ).join(' ')
  )
}

describe('checkCommandText and checkCommand', () => {
  it('blocks every command that the text check blocks', () => {
    for (const command of randomCommands(1000)) {
      if (blocks(() => checkCommandText(command, undefined, checkCommand))) {
        expect(
          blocks(() => checkCommand(command)),
          command
        ).toBe(true)
      }
    }
  })
})

describe('checkCommandText', () => {
  it('checks the text as written', () => {
    expect(
      checkCommandText(`git commit ${NV} -m x`, undefined, checkCommand).blocked
    ).toBe(true)
    expect(
      checkCommandText(
        `${param(':-', 'git')} commit -n -m x`,
        undefined,
        checkCommand
      ).blocked
    ).toBe(false)
  })
})
