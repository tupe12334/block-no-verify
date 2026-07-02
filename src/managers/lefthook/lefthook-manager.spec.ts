import { describe, it, expect } from 'vitest'
import { lefthookManager } from './lefthook-manager.js'

describe('lefthookManager', () => {
  it('should be named lefthook', () => {
    expect(lefthookManager.name).toBe('lefthook')
  })

  it('should detect LEFTHOOK=0', () => {
    expect(lefthookManager.detect('LEFTHOOK=0 git push origin main')).toBe(true)
  })

  it('should not detect a clean command', () => {
    expect(lefthookManager.detect('git push origin main')).toBe(false)
  })

  it('should build a reason mentioning LEFTHOOK=0 and the git command', () => {
    const reason = lefthookManager.reason('push')
    expect(reason).toContain('LEFTHOOK=0')
    expect(reason).toContain('push')
  })
})
