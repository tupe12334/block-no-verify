import { describe, it, expect } from 'vitest'
import { isDataProgram } from './is-data-program.js'

describe('isDataProgram', () => {
  it('is true for programs that print or search their arguments', () => {
    expect(isDataProgram('echo')).toBe(true)
    expect(isDataProgram('printf')).toBe(true)
    expect(isDataProgram('grep')).toBe(true)
  })

  it('is false for programs that may run their arguments', () => {
    expect(isDataProgram('bash')).toBe(false)
    expect(isDataProgram('eval')).toBe(false)
  })
})
