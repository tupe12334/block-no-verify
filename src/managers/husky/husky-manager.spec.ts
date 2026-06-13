import { describe, it, expect } from 'vitest'
import { huskyManager } from './husky-manager.js'

describe('huskyManager', () => {
  it('should be named husky', () => {
    expect(huskyManager.name).toBe('husky')
  })

  it('should detect HUSKY=0', () => {
    expect(huskyManager.detect('HUSKY=0 git commit -m "test"')).toBe(true)
  })

  it('should not detect a clean command', () => {
    expect(huskyManager.detect('git commit -m "test"')).toBe(false)
  })

  it('should build a reason mentioning HUSKY=0 and the git command', () => {
    const reason = huskyManager.reason('commit')
    expect(reason).toContain('HUSKY=0')
    expect(reason).toContain('commit')
  })
})
