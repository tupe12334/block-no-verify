import { describe, it, expect } from 'vitest'
import { COMMIT_SHORT_VALUE_OPTIONS } from './commit-short-options.js'

describe('COMMIT_SHORT_VALUE_OPTIONS', () => {
  it('lists the required-value letters from git commit -h', () => {
    expect([...COMMIT_SHORT_VALUE_OPTIONS.required].sort()).toEqual([
      'C',
      'F',
      'c',
      'm',
      't',
    ])
  })

  it('lists the optional-inline letters from git commit -h', () => {
    expect([...COMMIT_SHORT_VALUE_OPTIONS.optionalInline].sort()).toEqual([
      'S',
      'u',
    ])
  })

  it('never lists n, the --no-verify letter', () => {
    expect(COMMIT_SHORT_VALUE_OPTIONS.required.has('n')).toBe(false)
    expect(COMMIT_SHORT_VALUE_OPTIONS.optionalInline.has('n')).toBe(false)
  })
})
