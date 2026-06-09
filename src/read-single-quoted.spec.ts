import { describe, it, expect } from 'vitest'
import { readSingleQuoted } from './read-single-quoted.js'

describe('readSingleQuoted', () => {
  it('reads the content between single quotes', () => {
    const input = "x 'hello world' y"
    expect(readSingleQuoted(input, 2)).toEqual({
      value: 'hello world',
      next: 15,
    })
  })

  it('does not interpret content inside single quotes', () => {
    const input = "'a --no-verify b'"
    expect(readSingleQuoted(input, 0)).toEqual({
      value: 'a --no-verify b',
      next: 17,
    })
  })

  it('consumes to end of input when the quote is unterminated', () => {
    const input = "'unterminated"
    expect(readSingleQuoted(input, 0)).toEqual({
      value: 'unterminated',
      next: input.length,
    })
  })
})
