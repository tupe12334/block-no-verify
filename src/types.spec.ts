import { describe, it, expect } from 'vitest'
import { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'

describe('GIT_COMMANDS_WITH_NO_VERIFY', () => {
  it('should contain commit command', () => {
    expect(GIT_COMMANDS_WITH_NO_VERIFY).toContain('commit')
  })

  it('should contain push command', () => {
    expect(GIT_COMMANDS_WITH_NO_VERIFY).toContain('push')
  })

  it('should contain merge command', () => {
    expect(GIT_COMMANDS_WITH_NO_VERIFY).toContain('merge')
  })

  it('should contain cherry-pick command', () => {
    expect(GIT_COMMANDS_WITH_NO_VERIFY).toContain('cherry-pick')
  })

  it('should contain rebase command', () => {
    expect(GIT_COMMANDS_WITH_NO_VERIFY).toContain('rebase')
  })

  it('should contain am command', () => {
    expect(GIT_COMMANDS_WITH_NO_VERIFY).toContain('am')
  })

  it('should have exactly 6 commands', () => {
    expect(GIT_COMMANDS_WITH_NO_VERIFY).toHaveLength(6)
  })
})
