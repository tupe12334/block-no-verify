import { describe, it, expect } from 'vitest'
import { scanHashes } from './scan-hashes.js'

describe('scanHashes', () => {
  it('finds a comment that starts a word and ends at the newline', () => {
    expect(scanHashes('echo hi # note\ngit commit').comments).toEqual([[8, 14]])
  })

  it('finds a hash inside a word as text, not a comment', () => {
    expect(scanHashes('echo foo#bar')).toEqual({
      comments: [],
      wordHashes: [8],
    })
  })

  it('ignores a hash inside quotes and after a dollar sign', () => {
    expect(scanHashes('echo "a #b" $#')).toEqual({
      comments: [],
      wordHashes: [],
    })
  })
})
