import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'
import { detectGitCommand } from './detect-git-command.js'
import { hasHooksPathOverride } from './has-hooks-path-override.js'
import { hasNoVerifyFlag } from './has-no-verify-flag.js'
import { InputTooLongError } from './input-too-long-error.js'
import { MAX_INPUT_LENGTH } from './max-input-length.js'

const NO_VERIFY = '--no-' + 'verify'

/**
 * Joins `make(i)` for i = 0, 1, … with `separator` until the text is at
 * least `length` characters long.
 * @param length - The least length of the result.
 * @param make - Makes the i-th part.
 * @param separator - Text between parts.
 * @returns The joined text.
 */
function repeatParts(
  length: number,
  make: (i: number) => string,
  separator: string
): string {
  const parts: string[] = []
  let total = 0
  for (let i = 0; total < length; i++) {
    const part = make(i)
    parts.push(part)
    total += part.length + separator.length
  }
  return parts.join(separator)
}

/**
 * Checks a command and returns the result with the time the check took.
 * @param command - The command to check.
 * @returns The check result and its duration in milliseconds.
 */
function timedCheck(command: string): {
  blocked: boolean
  reason: string
  ms: number
} {
  const start = performance.now()
  const result = checkCommand(command)
  return {
    blocked: result.blocked,
    reason: result.reason === undefined ? '' : result.reason,
    ms: performance.now() - start,
  }
}

describe('checkCommand: large flat input', () => {
  describe('input length limit', () => {
    it('blocks a command longer than the limit', () => {
      const result = checkCommand(`echo ${'a'.repeat(MAX_INPUT_LENGTH)}`)
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain('could not check this command')
    })

    it('allows a PR body of 65,536 characters', () => {
      const body = repeatParts(65_536, i => `line ${String(i)} of text`, '\n')
      const command = `gh pr create --title "t" --body "${body.slice(0, 65_536)}"`
      expect(checkCommand(command).blocked).toBe(false)
    })

    it('blocks a variable expansion that grows past the limit', () => {
      const command = `a=${'x'.repeat(5000)}; echo${' $a'.repeat(2000)}`
      expect(command.length).toBeLessThan(MAX_INPUT_LENGTH)
      const result = checkCommand(command)
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain('could not check this command')
    })

    it('blocks one statement with very many git words', () => {
      const result = checkCommand(`echo ${'git '.repeat(3000)}`)
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain('could not check this command')
    })
  })

  describe('checks wide commands in linear time', () => {
    const shapes: [string, string][] = [
      [
        'many assignments',
        repeatParts(32_000, i => `x${String(i)}=${String(i)}`, '; '),
      ],
      [
        'many git commands',
        repeatParts(65_000, i => `git log -${String(i)}`, '; '),
      ],
      ['many heredocs on one line', `cat ${'<<A '.repeat(4000)}`],
    ]
    it.each(shapes)('%s', (_name, command) => {
      const result = timedCheck(command)
      expect(result.reason).not.toContain('could not check this command')
      // Main took 7 s to 13 s for each shape. The bound is loose for slow CI.
      expect(result.ms).toBeLessThan(3000)
    })
  })

  describe('still blocks a bypass in a large command', () => {
    const assignments = repeatParts(
      32_000,
      i => `x${String(i)}=${String(i)}`,
      '; '
    )

    it('after many assignments', () => {
      const result = checkCommand(
        `${assignments}; git commit ${NO_VERIFY} -m x`
      )
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain(NO_VERIFY)
    })

    it('hidden behind a variable after many assignments', () => {
      const result = checkCommand(
        `${assignments}; c=commit; git $c ${NO_VERIFY} -m x`
      )
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain(NO_VERIFY)
    })

    it('after many git commands', () => {
      const commands = repeatParts(60_000, i => `git log -${String(i)}`, '; ')
      const result = checkCommand(`${commands}; git push ${NO_VERIFY}`)
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain(NO_VERIFY)
    })
  })

  describe('one-line message values with many git words', () => {
    // 65,536 characters with 5,042 `git` words, on one line.
    const body = 'ran git here '.repeat(5042).slice(0, 65_536)
    const forms: [string, string][] = [
      ['gh --body "…"', `gh pr create --title t --body "${body}"`],
      ["gh --body '…'", `gh pr create --title t --body '${body}'`],
      ['gh --body="…"', `gh pr create --title t --body="${body}"`],
      ['git commit -m "…"', `git commit -m "${body}"`],
      ['git tag -m "…"', `git tag -a v1 -m "${body}"`],
    ]
    it.each(forms)('allows %s', (_name, command) => {
      const result = timedCheck(command)
      expect(result.blocked).toBe(false)
      // About 300 ms is the goal. The bound is loose for slow CI.
      expect(result.ms).toBeLessThan(3000)
    })

    it('still blocks a bypass after the body', () => {
      const result = checkCommand(
        `gh pr create --title t --body "${body}"; git push ${NO_VERIFY}`
      )
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain(NO_VERIFY)
    })

    it('still counts git words in an unmasked value', () => {
      const result = checkCommand(`echo -m "${'git '.repeat(3000)}"`)
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain('could not check this command')
    })
  })
})

describe('exported checks on input too large to check', () => {
  const expansion = `a=${'x'.repeat(5000)}; echo${' $a'.repeat(2000)}`

  it('detectGitCommand throws InputTooLongError', () => {
    expect(() => detectGitCommand(expansion)).toThrow(InputTooLongError)
  })

  it('detectGitCommand throws InputTooLongError on many git words', () => {
    expect(() => detectGitCommand(`echo ${'git '.repeat(3000)}`)).toThrow(
      InputTooLongError
    )
  })

  it('hasNoVerifyFlag throws InputTooLongError', () => {
    expect(() => hasNoVerifyFlag(expansion, 'commit')).toThrow(
      InputTooLongError
    )
  })

  it('hasHooksPathOverride throws InputTooLongError', () => {
    expect(() => hasHooksPathOverride(expansion)).toThrow(InputTooLongError)
  })
})
