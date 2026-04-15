import { describe, expect, it } from 'vitest'
import { getProperty } from './get-property.js'

describe('getProperty', () => {
  it('returns the value for an existing key', () => {
    expect(getProperty({ foo: 'bar' }, 'foo')).toBe('bar')
  })

  it('returns undefined for a missing key', () => {
    expect(getProperty({ foo: 'bar' }, 'baz')).toBeUndefined()
  })

  it('returns nested objects by reference', () => {
    const nested = { inner: 1 }
    expect(getProperty({ nested }, 'nested')).toBe(nested)
  })
})
