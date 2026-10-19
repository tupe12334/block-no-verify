import { describe, it, expect } from 'vitest'
import { maskMessageValues } from './mask-message-values.js'

describe('maskMessageValues', () => {
  it('masks the value after a message option and keeps its position', () => {
    expect(maskMessageValues('git commit -m "a LEFTHOOK=0 b"')).toBe(
      'git commit -m _'
    )
  })

  it('masks the value part of an --option=value token', () => {
    expect(maskMessageValues('git commit --message="a b"')).toBe(
      'git commit --message=_'
    )
  })

  it('masks gh title and body values', () => {
    expect(maskMessageValues('gh pr create --title "t t" --body "b b"')).toBe(
      'gh pr create --title _ --body _'
    )
  })

  it('keeps quoted text that is not a message value', () => {
    expect(maskMessageValues('bash -c "git commit"')).toBe('bash -c git commit')
  })

  it('keeps a message that contains a command substitution', () => {
    expect(maskMessageValues('git commit -m "$(echo hi)"')).toBe(
      'git commit -m $(echo hi)'
    )
  })

  it('resolves quotes around single words', () => {
    expect(maskMessageValues(`git -c 'core.hooksPath=/x' commit`)).toBe(
      'git -c core.hooksPath=/x commit'
    )
  })

  it('keeps control operators between statements', () => {
    expect(maskMessageValues('echo "a b" && git push')).toBe(
      'echo a b && git push'
    )
  })

  it('masks only when the program is git or gh', () => {
    expect(maskMessageValues('parallel -m "a b"')).toBe('parallel -m a b')
    expect(maskMessageValues('python -m "a b"')).toBe('python -m a b')
  })

  it('finds the program after env assignments and per statement', () => {
    expect(maskMessageValues('A=1 /usr/bin/git commit -m "a b"')).toBe(
      'A=1 /usr/bin/git commit -m _'
    )
    expect(maskMessageValues('git commit -m "a b" && parallel -m "c d"')).toBe(
      'git commit -m _ && parallel -m c d'
    )
  })
})
