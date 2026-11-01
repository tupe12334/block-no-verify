import { describe, it, expect } from 'vitest'
import { isInComment } from './is-in-comment.js'

describe('isInComment', () => {
  it('is true after a word-start hash on the same line', () => {
    expect(isInComment('echo a # git', 9)).toBe(true)
  })

  it('is false for a git after a word-internal hash', () => {
    expect(isInComment('echo foo#bar; git', 14)).toBe(false)
  })
})
