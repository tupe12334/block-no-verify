import { describe, it, expect } from 'vitest'
import { readShellWord } from './read-shell-word.js'

describe('readShellWord', () => {
  it('reads a word and removes its quotes', () => {
    expect(readShellWord('a"b c"\'d\' e', 0)).toEqual({
      end: 9,
      value: 'ab cd',
      quoteStart: 6,
      quotes: 2,
      operator: false,
    })
  })

  it('keeps an escaped quote in a double-quoted part', () => {
    expect(readShellWord('"a\\"b" c', 0)?.value).toBe('a"b')
  })

  it('reads an operator as one character', () => {
    expect(readShellWord('; x', 0)).toMatchObject({ end: 1, operator: true })
  })

  it('reads an unquoted glob as an operator', () => {
    expect(readShellWord('*.ts x', 0)?.operator).toBe(true)
    expect(readShellWord('"*.ts" x', 0)?.operator).toBe(false)
  })

  it('returns null when a quote is not closed', () => {
    expect(readShellWord('"abc', 0)).toBeNull()
  })
})
