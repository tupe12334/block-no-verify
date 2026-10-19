/* cspell:disable */
import { describe, it, expect } from 'vitest'
import { readSplitStringOption } from './read-split-string-option.js'

describe('readSplitStringOption', () => {
  it.each(['-S', '-iS', '-vS', '--split-string'])(
    'takes the next word as the value after %s',
    token => {
      expect(readSplitStringOption(token)).toBeUndefined()
    }
  )

  it.each([
    ['-Sgit status', 'git status'],
    ['-iSgit status', 'git status'],
    ['--split-string=git status', 'git status'],
  ])('reads the attached value of %s', (token, value) => {
    expect(readSplitStringOption(token)).toBe(value)
  })

  it.each(['-i', '-u', 'git', '--split'])('ignores %s', token => {
    expect(readSplitStringOption(token)).toBeNull()
  })
})
