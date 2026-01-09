import { describe, it, expect } from 'vitest'
import { EXIT_CODES } from './exit-codes.js'

describe('EXIT_CODES', () => {
  it('should have ALLOWED as 0', () => {
    expect(EXIT_CODES.ALLOWED).toBe(0)
  })

  it('should have BLOCKED as 2', () => {
    expect(EXIT_CODES.BLOCKED).toBe(2)
  })

  it('should have ERROR as 1', () => {
    expect(EXIT_CODES.ERROR).toBe(1)
  })
})
