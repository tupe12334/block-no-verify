import { describe, it, expect } from 'vitest'
import { overcommitManager } from './overcommit-manager.js'

describe('overcommitManager', () => {
  it('should be named overcommit', () => {
    expect(overcommitManager.name).toBe('overcommit')
  })

  it('should detect OVERCOMMIT_DISABLE=1', () => {
    expect(
      overcommitManager.detect('OVERCOMMIT_DISABLE=1 git push origin main')
    ).toBe(true)
  })

  it('should not detect a clean command', () => {
    expect(overcommitManager.detect('git push origin main')).toBe(false)
  })

  it('should build a reason mentioning OVERCOMMIT_DISABLE=1 and the git command', () => {
    const reason = overcommitManager.reason('push')
    expect(reason).toContain('OVERCOMMIT_DISABLE=1')
    expect(reason).toContain('push')
  })
})
