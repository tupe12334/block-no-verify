import { describe, it, expect } from 'vitest'
import { findStatementEnd } from './find-statement-end.js'

describe('findStatementEnd', () => {
  it('returns input.length when the input is a single statement', () => {
    const input = 'git commit -m "test"'
    expect(findStatementEnd(input, 0)).toBe(input.length)
  })

  it('finds the index of a `;` separator', () => {
    const input = 'git commit -m "test"; echo done'
    expect(findStatementEnd(input, 0)).toBe(input.indexOf(';'))
  })

  it('finds the index of the first `&` in a `&&` separator', () => {
    const input = 'git commit -m "test" && echo done'
    expect(findStatementEnd(input, 0)).toBe(input.indexOf('&&'))
  })

  it('finds the index of the first `|` in a `||` separator', () => {
    const input = 'git commit -m "test" || echo done'
    expect(findStatementEnd(input, 0)).toBe(input.indexOf('||'))
  })

  it('finds the index of a single `|` pipe separator', () => {
    const input = 'git log | grep test'
    expect(findStatementEnd(input, 0)).toBe(input.indexOf('|'))
  })

  it('finds the index of a newline separator', () => {
    const input = 'git commit -m "test"\necho done'
    expect(findStatementEnd(input, 0)).toBe(input.indexOf('\n'))
  })

  it('finds the earliest separator when several are present', () => {
    const input = 'echo a; echo b && echo c'
    expect(findStatementEnd(input, 0)).toBe(input.indexOf(';'))
  })

  it('searches only from the given start offset', () => {
    const input = 'echo a; echo b; echo c'
    const firstEnd = input.indexOf(';')
    const secondEnd = input.indexOf(';', firstEnd + 1)
    expect(findStatementEnd(input, firstEnd + 1)).toBe(secondEnd)
  })
})
