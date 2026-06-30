import { describe, it, expect } from 'vitest'
import { preCommitManager } from './pre-commit-manager.js'

describe('preCommitManager', () => {
  it('should be named pre-commit', () => {
    expect(preCommitManager.name).toBe('pre-commit')
  })

  it('should detect SKIP=pre-push', () => {
    expect(preCommitManager.detect('SKIP=pre-push git push origin main')).toBe(
      true
    )
  })

  it('should not detect a clean command', () => {
    expect(preCommitManager.detect('git push origin main')).toBe(false)
  })

  it('should build a reason mentioning SKIP= and the git command', () => {
    const reason = preCommitManager.reason('push')
    expect(reason).toContain('SKIP=')
    expect(reason).toContain('push')
  })
})
