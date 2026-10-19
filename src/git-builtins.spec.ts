import { describe, it, expect } from 'vitest'
import { GIT_BUILTINS } from './git-builtins.js'

describe('GIT_BUILTINS', () => {
  it('contains common built-ins', () => {
    for (const command of ['commit', 'push', 'grep', 'log', 'status']) {
      expect(GIT_BUILTINS.has(command)).toBe(true)
    }
  })

  it('does not contain alias-like names', () => {
    expect(GIT_BUILTINS.has('ci')).toBe(false)
  })
})
