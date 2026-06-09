import { describe, it, expect } from 'vitest'
import { readDoubleQuoted } from './read-double-quoted.js'

describe('readDoubleQuoted', () => {
  it('reads the content between double quotes', () => {
    const input = 'x "hello world" y'
    expect(readDoubleQuoted(input, 2)).toEqual({
      value: 'hello world',
      next: 15,
    })
  })

  it('does not interpret flags inside double quotes', () => {
    const input = '"a --no-verify b"'
    expect(readDoubleQuoted(input, 0)).toEqual({
      value: 'a --no-verify b',
      next: 17,
    })
  })

  it('honors backslash escapes for " \\ $ and `', () => {
    const input = '"a \\"b\\" \\$c"'
    expect(readDoubleQuoted(input, 0).value).toBe('a "b" $c')
  })

  it('keeps an embedded command substitution as literal text', () => {
    const input = '"$(cat file)"'
    expect(readDoubleQuoted(input, 0).value).toBe('$(cat file)')
  })
})
