import { describe, it, expect } from 'vitest'
import { managers } from './managers.js'

describe('managers registry', () => {
  it('should register the husky manager', () => {
    expect(managers.some(m => m.name === 'husky')).toBe(true)
  })

  it('every manager should expose detect and reason functions', () => {
    for (const manager of managers) {
      expect(typeof manager.detect).toBe('function')
      expect(typeof manager.reason).toBe('function')
    }
  })

  it('every manager should have a non-empty name', () => {
    for (const manager of managers) {
      expect(manager.name.length).toBeGreaterThan(0)
    }
  })
})
