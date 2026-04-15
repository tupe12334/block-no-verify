import { describe, expect, it } from 'vitest'
import { hasProperty } from './json-helpers.js'

describe('hasProperty', () => {
  it('returns true for own properties', () => {
    expect(hasProperty({ foo: 1 }, 'foo')).toBe(true)
  })

  it('returns false for missing properties', () => {
    expect(hasProperty({ foo: 1 }, 'bar')).toBe(false)
  })

  it('returns false for inherited properties', () => {
    const parent = { inherited: 1 }
    const child: object = Object.create(parent)
    expect(hasProperty(child, 'inherited')).toBe(false)
  })

  it('returns true for properties set directly on the instance', () => {
    const obj: Record<string, number> = {}
    obj.foo = 2
    expect(hasProperty(obj, 'foo')).toBe(true)
  })
})
