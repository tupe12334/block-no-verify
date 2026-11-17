import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkCommand } from './check-command.js'
import type { findMessageValueSpans as FindMessageValueSpans } from './find-message-value-spans.js'

const spans = vi.hoisted(() => ({ calls: 0 }))

vi.mock('./find-message-value-spans.js', async importOriginal => {
  const actual = await importOriginal<{
    findMessageValueSpans: typeof FindMessageValueSpans
  }>()
  return {
    findMessageValueSpans: (input: string) => {
      spans.calls++
      return actual.findMessageValueSpans(input)
    },
  }
})

const NO_VERIFY = '--no-' + 'verify'

const PIECES = [
  'git',
  'git ',
  ' git',
  'gh pr create',
  ' commit',
  ' push',
  "pu'sh'",
  'pu"sh"',
  ` ${NO_VERIFY}`,
  ' -n',
  ' -m ',
  ' --body ',
  ' --message=',
  '"',
  "'",
  '\\',
  '`',
  '$(',
  ')',
  ';',
  '&&',
  '|',
  '#',
  '\n',
  '*',
  'g=git; ',
  '$g',
  'HUSKY=0 ',
  'core.hooksPath=x',
  'alias',
  'text ',
  ' ',
]

/**
 * Makes `count` small random commands from {@link PIECES}, the same ones on
 * every run.
 * @param count - How many commands to make.
 * @returns The commands.
 */
function randomCommands(count: number): string[] {
  let seed = 7
  const random = (n: number): number => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed % n
  }
  const commands: string[] = []
  for (let i = 0; i < count; i++) {
    let command = ''
    const length = 1 + random(16)
    for (let j = 0; j < length; j++) command += PIECES[random(PIECES.length)]
    commands.push(command)
  }
  return commands
}

describe('detectGitCommand: message value exemption', () => {
  beforeEach(() => {
    spans.calls = 0
  })

  it('never runs for small commands, so their result is unchanged', () => {
    for (const command of randomCommands(2000)) checkCommand(command)
    expect(spans.calls).toBe(0)
  })

  it('runs for a large body that is over the parse limit', () => {
    const body = 'ran git here '.repeat(5042).slice(0, 65_536)
    const result = checkCommand(`gh pr create --title t --body "${body}"`)
    expect(result.blocked).toBe(false)
    expect(spans.calls).toBeGreaterThan(0)
  })

  it('does not run when the large command has a hook-skip signal', () => {
    const body = 'ran git here '.repeat(5042).slice(0, 65_536)
    const result = checkCommand(
      `gh pr create --title t --body "${body}" ${NO_VERIFY}`
    )
    expect(result.blocked).toBe(true)
    expect(result.reason).toContain('could not check this command')
    expect(spans.calls).toBe(0)
  })
})
