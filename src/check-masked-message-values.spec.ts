// cspell:ignore mmit
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkCommand } from './check-command.js'
import { checkMaskedMessageValues } from './check-masked-message-values.js'
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
const ALLOWED = { blocked: false }

const PIECES = [
  'git',
  'git ',
  ' git',
  "g''it",
  'gh pr create',
  'gh x',
  ' commit',
  ' push',
  "pu'sh'",
  "co''mmit",
  'pu"sh"',
  ` ${NO_VERIFY}`,
  " --no''-veri",
  " --no-ve''ri",
  ' --no-veri',
  ' -n',
  " -''n",
  " -a''n",
  ' -m ',
  ' -m x',
  ' --body ',
  ' --message \'git "commit"\'',
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
  "f=--no''-verify; ",
  '$f',
  'HUSKY=0 ',
  'SKIP=x ',
  ' -c core.hooksPath=x',
  " -c core.hoo''ksPath=x",
  'alias',
  'text ',
  ' ',
]

/**
 * Makes `count` small random commands from {@link PIECES}, the same ones on
 * every run.
 * @param count - How many commands to make.
 * @param seed - Seed for the commands.
 * @returns The commands.
 */
function randomCommands(count: number, seed: number): string[] {
  let state = seed
  const random = (n: number): number => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state % n
  }
  const commands: string[] = []
  for (let i = 0; i < count; i++) {
    let command = ''
    const length = 1 + random(12)
    for (let j = 0; j < length; j++) command += PIECES[random(PIECES.length)]
    commands.push(command)
  }
  return commands
}

describe('checkMaskedMessageValues', () => {
  beforeEach(() => {
    spans.calls = 0
  })

  it('checks the text with each message value masked', () => {
    const check = vi.fn(() => ALLOWED)
    const result = checkMaskedMessageValues(
      'gh pr create --title "a b" --body \'git log\'',
      check
    )
    expect(check).toHaveBeenCalledWith('gh pr create --title "x" --body \'x\'')
    expect(result).toEqual(ALLOWED)
  })

  it('returns null when there is no value to mask', () => {
    expect(checkMaskedMessageValues('echo git log', () => ALLOWED)).toBeNull()
    expect(
      checkMaskedMessageValues('git commit -m "x"', () => ALLOWED)
    ).toBeNull()
  })

  it('returns null for a hook-skip signal', () => {
    const text = `gh pr create --body "git log" ${NO_VERIFY}`
    expect(checkMaskedMessageValues(text, () => ALLOWED)).toBeNull()
  })

  it('returns null when the masked copy bypasses any guarded command', () => {
    const text = "gh x --message 'git \"commit\"' --no''-veri"
    expect(checkMaskedMessageValues(text, () => ALLOWED)).toBeNull()
  })

  it('never runs for small commands, so their result matches main', () => {
    for (const command of randomCommands(2000, 7)) checkCommand(command)
    expect(spans.calls).toBe(0)
  })

  it('blocks each blocked small command padded with a long body', () => {
    // About 10,000 characters with 800 `git` words: over the parse limit.
    // Each padded case runs the capped scan first (about 80 ms locally), so
    // this is a seeded sample of 20 commands. A wider sweep is run by hand.
    const body = 'ran git here '.repeat(800)
    const blocked = randomCommands(2000, 11)
      .filter(command => checkCommand(command).blocked)
      .slice(0, 20)
    expect(blocked.length).toBe(20)
    for (const command of blocked) {
      for (const padded of [
        `${command} --body "${body}"`,
        `gh pr create --title t --body "${body}"; ${command}`,
        `${command}; gh pr create --title t --body "${body}"`,
      ]) {
        expect(checkCommand(padded).blocked, padded.slice(0, 200)).toBe(true)
      }
    }
  }, 120_000)
})
