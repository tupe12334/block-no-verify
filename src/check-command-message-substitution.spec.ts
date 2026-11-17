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
})
