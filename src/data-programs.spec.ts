import { describe, it, expect } from 'vitest'
import { DATA_PROGRAMS } from './data-programs.js'

describe('DATA_PROGRAMS', () => {
  it.each(['echo', 'printf', 'cat', 'tee', 'grep'])('lists %s', program => {
    expect(DATA_PROGRAMS.has(program)).toBe(true)
  })

  // Each of these can run a command it is given.
  it.each(['sh', 'eval', 'xargs', 'env', 'sed', 'awk', 'find', 'sort'])(
    'leaves out %s',
    program => {
      expect(DATA_PROGRAMS.has(program)).toBe(false)
    }
  )
})
