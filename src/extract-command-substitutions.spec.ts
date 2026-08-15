import { describe, it, expect } from 'vitest'
import { extractCommandSubstitutions } from './extract-command-substitutions.js'

describe('extractCommandSubstitutions', () => {
  it('returns an empty array for a token with no substitution', () => {
    expect(extractCommandSubstitutions('plain text')).toEqual([])
  })

  it('extracts the inner command of a $(...) substitution', () => {
    expect(extractCommandSubstitutions('$(git commit --no-verify)')).toEqual([
      'git commit --no-verify',
    ])
  })

  it('extracts the inner command of a backtick substitution', () => {
    expect(extractCommandSubstitutions('`git commit --no-verify`')).toEqual([
      'git commit --no-verify',
    ])
  })

  it('extracts a substitution surrounded by other text', () => {
    expect(
      extractCommandSubstitutions('OUT=$(git commit --no-verify) done')
    ).toEqual(['git commit --no-verify'])
  })

  it('honors nested parens when finding the closing paren', () => {
    expect(
      extractCommandSubstitutions('$(git log --format=%H | head -n $(echo 1))')
    ).toEqual(['git log --format=%H | head -n $(echo 1)'])
  })

  it('extracts multiple substitutions from the same token', () => {
    expect(
      extractCommandSubstitutions('$(git commit --no-verify) && `git push -n`')
    ).toEqual(['git commit --no-verify', 'git push -n'])
  })

  it('ignores an unterminated substitution instead of throwing', () => {
    expect(extractCommandSubstitutions('$(git commit --no-verify')).toEqual([])
    expect(extractCommandSubstitutions('`git commit --no-verify')).toEqual([])
  })
})
