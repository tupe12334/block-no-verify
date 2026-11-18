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
      // The bypass is a hook-skip signal, so the body is not exempt.
      expect(result.reason).toContain('could not check this command')
    })

    it('still counts git words in an unmasked value', () => {
      const result = checkCommand(`echo -m "${'git '.repeat(3000)}"`)
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain('could not check this command')
    })
  })

  describe('a quote-split sub-command in a small message value', () => {
    const commands: [string, string][] = [
      ['gh pr create --body', `gh pr create --body "git pu'sh'" ${NO_VERIFY}`],
      ['gh alias --message', `gh x --message "git pu'sh'" ${NO_VERIFY}`],
      [
        'escaped glob first',
        `./runner \\* gh pr create --body "git pu'sh'" ${NO_VERIFY}`,
      ],
    ]
    it.each(commands)('blocks %s', (_name, command) => {
      expect(checkCommand(command).blocked).toBe(true)
    })
  })
  describe('a hook skip next to a long message value', () => {
    const body = 'ran git here '.repeat(5042).slice(0, 65_536)
    const gh = `gh x --body "${body}" --message 'git "commit"'`
    const commands: [string, string][] = [
      ['quote-split flag', `${gh} --no''-veri`],
      ['quote-split full flag', `${gh} --no''${NO_VERIFY.slice(4)}`],
      ['quote-split prefix', `${gh} --no-ve''ri`],
      ['prefix', `${gh} --no-veri`],
      ['quote-split -n cluster', `${gh} -a''n`],
      ['quote-split -n', `${gh} -''n`],
      [
        'git tag with a quote-split flag',
        `git tag -a v1 -m "${body}" --no''-veri`,
      ],
      ['hooksPath', `${gh} -c core.hooksPath=/dev/null`],
      ['quote-split hooksPath', `${gh} -c core.hoo''ksPath=/dev/null`],
      ['hook-manager env var', `HUSKY=0 ${gh}`],
      ['skip env var', `SKIP=lint ${gh}`],
      ['variable flag', `f=--no''-veri; ${gh} $f`],
    ]
    it.each(commands)('blocks a %s', (_name, command) => {
      expect(checkCommand(command).blocked).toBe(true)
    })
  })
  describe('a long value with more text in its shell word', () => {
    const body = 'ran git here '.repeat(5042).slice(0, 65_536)
    const skip = `--message 'git "commit"' --no''-veri`
    const commands: [string, string][] = [
      [
        'single quote then substitution',
        `gh pr create --body '${body}'"$(git commit ${NO_VERIFY})"`,
      ],
      ['single quote then variable', `x=${NO_VERIFY}; gh x --body '${body}'$x`],
      [
        'single quote then escaped space',
        `gh x --body '${body}'\\ ${NO_VERIFY}`,
      ],
      ['two single-quoted parts', `gh x --message '${body}'' ${NO_VERIFY}'`],
      ['single quote then bare text', `gh x --body '${body}'ab ${skip}`],
      ['double quote then single quote', `gh x --body "${body}"'a' ${skip}`],
      ['double quote then escaped quote', `gh x --body "${body}"\\" ${skip}`],
      ['escaped space then single quote', `gh x --body a\\ '${body}' ${skip}`],
      ['single-quoted value with a $', `gh x --body '${body} $x' ${skip}`],
      ['--body= form', `gh x --body='${body}' ${skip}`],
    ]
    it.each(commands)('blocks %s', (_name, command) => {
      const result = checkCommand(command)
      expect(result.blocked).toBe(true)
    })

    it('blocks the --body= form of a plain body by the cap', () => {
      const result = checkCommand(`gh pr create --title t --body="${body}"`)
      expect(result.reason).toContain('could not check this command')
    })
  })
  describe('a long value under another program', () => {
    const pad = 'git '.repeat(15_000)
    const value = `': ${pad}; git "commit" "-n"'`
    const commands: [string, string][] = [
      ['backtick substitution', `git status \`parallel -m ${value} ::: x\``],
      ['$( ) substitution', `git status $(parallel -m ${value} ::: x)`],
      ['<( ) substitution', `git status <(parallel -m ${value} ::: x)`],
      ['>( ) substitution', `git status >(parallel -m ${value} ::: x)`],
      ['xargs after a pipe', `git status | xargs -m ${value}`],
      ['xargs after &&', `git status && xargs -m ${value}`],
      [
        'sh -c payload',
        `git status; sh -c 'parallel -m "${pad}; git commit -n" ::: x'`,
      ],
      ['eval', `git status; eval parallel -m ${value} ::: x`],
      ['brace group', `git status; { parallel -m ${value} ::: x; }`],
      ['glob before git', `echo *.ts git status -m ${value}`],
      ['redirect before git', `echo > git -m ${value}`],
    ]
    it.each(commands)('blocks a %s', (_name, command) => {
      expect(checkCommand(command).blocked).toBe(true)
    })
  })
  describe('a -m value of a sub-command where -m takes no message', () => {
    const padding = 'ran git here '.repeat(5042).slice(0, 65_536)
    const pr = `gh pr create --title t --body "${padding}"`
    const commands: [string, string][] = [
      ['rebase -m "-n"', `${pr}; git rebase -m "-n" main`],
      [
        'rebase -m with the skip flag',
        `${pr}; git rebase -m "${NO_VERIFY}" main`,
      ],
      ['cherry-pick -m "-n"', `${pr}; git cherry-pick -m "-n" abc`],
      ['revert -m "-n"', `${pr}; git revert -m "-n" HEAD`],
      ['stash -m "-n"', `${pr}; git stash -m "-n"`],
      [
        'cherry-pick -m with the skip flag',
        `${pr}; git cherry-pick -m "${NO_VERIFY}" abc`,
      ],
      [
        'revert -m with the skip flag',
        `${pr}; git revert -m "${NO_VERIFY}" HEAD`,
      ],
      ['commit after a global option', `${pr}; git -C . commit -m "-n"`],
      ['stash without push', `${pr}; git stash -m "${NO_VERIFY}"`],
    ]
    it.each(commands)('blocks %s', (_name, command) => {
      expect(checkCommand(command).blocked).toBe(true)
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
