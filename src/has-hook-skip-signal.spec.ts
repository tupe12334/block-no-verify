import { describe, it, expect } from 'vitest'
import { hasHookSkipSignal } from './has-hook-skip-signal.js'

const NO_VERIFY = '--no-' + 'verify'

describe('hasHookSkipSignal', () => {
  it.each([
    `git commit ${NO_VERIFY}`,
    'git commit --no-veri',
    'git commit -an',
    'git commit -n',
    'git -c core.hooksPath=x commit',
    'git config alias.c commit',
    'gh alias set c pr',
    'HUSKY=0 git commit',
    'LEFTHOOK=0 git commit',
    'OVERCOMMIT_DISABLE=1 git commit',
    'SKIP=lint git commit',
    'gh pr create --body "git pu\'sh\'"',
    'g""it commit',
    "g'h' pr create",
  ])('finds a signal in %s', text => {
    expect(hasHookSkipSignal(text)).toBe(true)
  })

  it.each([
    'gh pr create --title t --body "ran git here ran git here"',
    'git commit -m "fix the parser"',
    'gh pr create --body "don\'t skip the tests"',
    'git tag -a v1 -m "release"',
  ])('finds no signal in %s', text => {
    expect(hasHookSkipSignal(text)).toBe(false)
  })
})
