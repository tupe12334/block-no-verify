import { describe, it, expect } from 'vitest'
import { hasSkipFlagWord } from './has-skip-flag-word.js'

const NO_VERIFY = '--no-' + 'verify'

describe('hasSkipFlagWord', () => {
  it.each([
    'git rebase -m "-n" main',
    'git commit -an',
    `git commit ${NO_VERIFY}`,
    "git commit --no''-veri",
    'git commit --no-ve"ri"',
    "git cherry-pick -m '-n' abc",
  ])('finds a flag in %s', text => {
    expect(hasSkipFlagWord(text)).toBe(true)
  })

  it.each([
    'gh pr create --title "x" --body "x"',
    'git commit -m "x"',
    'git tag -a v1 -m "x"',
    'git log --name-only',
  ])('finds no flag in %s', text => {
    expect(hasSkipFlagWord(text)).toBe(false)
  })
})
