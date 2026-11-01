// cspell:ignore Skeyn keyn
import { describe, it, expect } from 'vitest'
import { readCommitShortBundle } from './commit-short-bundle.js'

describe('readCommitShortBundle', () => {
  it('returns null for a token that is not a single-dash bundle', () => {
    expect(readCommitShortBundle('--no-verify')).toBeNull()
    expect(readCommitShortBundle('message')).toBeNull()
    expect(readCommitShortBundle('-1')).toBeNull()
  })

  it('enables --no-verify for -n and for -n bundled before a value letter', () => {
    expect(readCommitShortBundle('-n')?.enablesNoVerify).toBe(true)
    expect(readCommitShortBundle('-nm')?.enablesNoVerify).toBe(true)
    expect(readCommitShortBundle('-qn')?.enablesNoVerify).toBe(true)
  })

  it('takes the next token when a value letter ends the bundle', () => {
    expect(readCommitShortBundle('-m')?.takesNextToken).toBe(true)
    expect(readCommitShortBundle('-am')?.takesNextToken).toBe(true)
    expect(readCommitShortBundle('-aF')?.takesNextToken).toBe(true)
  })

  it('does not take the next token when a value letter has its value inline', () => {
    expect(readCommitShortBundle('-mn')).toEqual({
      enablesNoVerify: false,
      takesNextToken: false,
    })
    expect(readCommitShortBundle('-tn')?.enablesNoVerify).toBe(false)
    expect(readCommitShortBundle('-Skeyn')?.enablesNoVerify).toBe(false)
  })

  it('never takes the next token after an optional-inline letter', () => {
    expect(readCommitShortBundle('-u')?.takesNextToken).toBe(false)
    expect(readCommitShortBundle('-S')?.takesNextToken).toBe(false)
    expect(readCommitShortBundle('-uno')?.takesNextToken).toBe(false)
  })

  it('reads a plain flag bundle as neither', () => {
    expect(readCommitShortBundle('-a')).toEqual({
      enablesNoVerify: false,
      takesNextToken: false,
    })
  })
})
