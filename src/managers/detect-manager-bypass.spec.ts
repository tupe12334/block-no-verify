import { describe, it, expect } from 'vitest'
import { detectManagerBypass } from './detect-manager-bypass.js'

describe('detectManagerBypass', () => {
  it('should return a reason for HUSKY=0', () => {
    const reason = detectManagerBypass('HUSKY=0 git commit -m "test"', 'commit')
    expect(reason).not.toBeNull()
    expect(reason).toContain('HUSKY=0')
    expect(reason).toContain('commit')
  })

  it('should embed the git command in the reason', () => {
    const reason = detectManagerBypass('HUSKY=0 git push origin main', 'push')
    expect(reason).toContain('push')
  })

  it('should return null for a clean command', () => {
    expect(detectManagerBypass('git commit -m "test"', 'commit')).toBeNull()
  })

  it('should not flag HUSKY=1', () => {
    expect(detectManagerBypass('HUSKY=1 git push', 'push')).toBeNull()
  })
})
