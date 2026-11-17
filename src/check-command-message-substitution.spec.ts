import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

const B = '`'
const ENV_SKIPS = [
  'HUSKY' + '=0',
  'LEFTHOOK' + '=0',
  'LEFTHOOK_EXCLUDE' + '=lint',
  'OVERCOMMIT_DISABLE' + '=1',
  'SKIP' + '=lint',
]

describe('checkCommand: command substitutions inside message values', () => {
  describe('blocks a backtick substitution that runs a hook bypass', () => {
    const shapes: [string, (inner: string) => string][] = [
      ['-m "…"', c => `git commit -m "msg ${B}${c}${B}"`],
      ['-m unquoted', c => `git commit -m ${B}${c}${B}`],
      ['--message="…"', c => `git commit --message="msg ${B}${c}${B}"`],
      ['--message "…"', c => `git commit --message "msg ${B}${c}${B}"`],
      ['-F "…"', c => `git commit -F "${B}${c}${B}"`],
      ['nested in $(…)', c => `git commit -m "msg $(echo ${B}${c}${B})"`],
      ['inside bash -c', c => `bash -c 'git commit -m "msg ${B}${c}${B}"'`],
      ['gh --body', c => `gh pr create --title t --body "x ${B}${c}${B}"`],
    ]
    for (const [name, shape] of shapes) {
      it.each(ENV_SKIPS)(`${name} with %s`, env => {
        expect(checkCommand(shape(`${env} git commit -m x`)).blocked).toBe(true)
      })
    }
  })

  describe('still blocks a $(…) substitution that runs a hook bypass', () => {
    it.each([
      `git commit -m "msg $(${ENV_SKIPS[0]} git commit -m x)"`,
      `git commit --message="msg $(${ENV_SKIPS[0]} git commit -m x)"`,
      `git commit -m "msg $(echo $(${ENV_SKIPS[0]} git commit -m x))"`,
    ])('%s', command => {
      expect(checkCommand(command).blocked).toBe(true)
    })
  })

  describe('allows', () => {
    it.each([
      `git commit -m 'msg ${B}${ENV_SKIPS[0]} git commit -m x${B}'`,
      `git commit -m "fix: use \\${B}foo\\${B} helper"`,
      `git commit -m "fix: use \\${B}${ENV_SKIPS[0]} git commit\\${B} text"`,
      'git commit -m "release $(date +%F)"',
      `git commit -m "release ${B}date${B}"`,
    ])('%s', command => {
      expect(checkCommand(command).blocked).toBe(false)
    })
  })

  describe('nested substitutions', () => {
    const nest = (depth: number, body: string): string =>
      `git commit -m "${'$('.repeat(depth)}${body}${')'.repeat(depth)}"`

    it.each([20, 30])('checks depth %i in under 200 ms', depth => {
      const start = performance.now()
      const result = checkCommand(nest(depth, 'x'))
      expect(performance.now() - start).toBeLessThan(200)
      expect(result.blocked).toBe(false)
    })

    it('blocks a bypass at depth 30', () => {
      expect(
        checkCommand(nest(30, `${ENV_SKIPS[0]} git commit -m x`)).blocked
      ).toBe(true)
    })

    it('blocks input nested past the limit', () => {
      const result = checkCommand(nest(500, 'x'))
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain('could not check this command')
    })

    it('blocks a long body nested deep instead of checking every level', () => {
      const result = checkCommand(nest(50, `echo ${'word '.repeat(4000)}`))
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain('could not check this command')
    })
  })

  describe('scan work limit', () => {
    const chain = (depth: number, unit: string): string =>
      `git commit -m "${`$(${unit} `.repeat(depth)}x${')'.repeat(depth)}"`

    it('blocks a short message whose nested checks would do too much work', () => {
      const command = chain(49, 'X=1 Y=2 git log')
      expect(command.length).toBeLessThan(1100)
      const result = checkCommand(command)
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain('could not check this command')
    })

    it('blocks the same message repeated 80 times', () => {
      const one = chain(49, 'X=1 Y=2 git log').slice(15, -1)
      const result = checkCommand(`git commit -m "${`${one} `.repeat(80)}"`)
      expect(result.blocked).toBe(true)
    })

    it('still checks a shallower chain of the same shape', () => {
      expect(checkCommand(chain(10, 'X=1 Y=2 git log')).blocked).toBe(false)
    })

    it('counts nested backticks toward the depth limit', () => {
      let command = 'x'
      for (let level = 0; level < 6; level++) {
        command = `echo ${command.replace(/[\\`]/g, '\\$&')}`
        command = `\`${command}\``
      }
      const deep = `git commit -m "${'$('.repeat(45)}${command}${')'.repeat(45)}"`
      expect(checkCommand(deep).blocked).toBe(true)
    })

    it('finishes or blocks random nested input in bounded time', () => {
      const units = [
        'git log -1',
        'echo git commit',
        'X=1 Y=2 git log',
        'git log ${A:-b}',
        'cat <<EOF',
        'printf "%s" "git log"',
        'git log `date`',
      ]
      let seed = 7
      const random = (n: number): number => {
        seed = (seed * 1103515245 + 12345) % 2147483648
        return seed % n
      }
      for (let run = 0; run < 40; run++) {
        const parts: string[] = []
        for (let i = 0; i < 1 + random(4); i++) {
          parts.push(chain(1 + random(50), units[random(units.length)]))
        }
        const start = performance.now()
        checkCommand(parts.join(' && '))
        expect(performance.now() - start).toBeLessThan(10000)
      }
    }, 120000)
  })
})
