import { describe, it, expect } from 'vitest'
import { maskQuotedText } from './mask-quoted-text.js'

describe('maskQuotedText', () => {
  it('masks whitespace-bearing free text and keeps its position', () => {
    expect(maskQuotedText('git commit -m "a LEFTHOOK=0 b"')).toBe(
      'git commit -m _'
    )
  })

  it('resolves quotes around single words', () => {
    expect(maskQuotedText(`git -c 'core.hooksPath=/x' commit`)).toBe(
      'git -c core.hooksPath=/x commit'
    )
  })

  it('keeps key=value tokens that contain whitespace', () => {
    expect(maskQuotedText('A="x y" git commit')).toBe('A=x y git commit')
  })

  it('keeps control operators between statements', () => {
    expect(maskQuotedText('echo "a b" && git push')).toBe('echo _ && git push')
  })
})
