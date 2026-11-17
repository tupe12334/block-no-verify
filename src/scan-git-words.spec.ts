import { describe, it, expect } from 'vitest'
import { InputTooLongError } from './input-too-long-error.js'
import { scanGitWords } from './scan-git-words.js'

describe('scanGitWords', () => {
  it('finds the sub-command after a git word', () => {
    expect(scanGitWords('git log; git push', [])).toBe('push')
  })

  it('finds a sub-command split by quotes', () => {
    expect(scanGitWords('git pu"sh"', [])).toBe('push')
  })

  it('skips a git word in a comment', () => {
    expect(scanGitWords('echo # git push', [])).toBeNull()
  })

  it('throws when the searches would parse too much text', () => {
    expect(() => scanGitWords(`echo ${'git '.repeat(3000)}`, [])).toThrow(
      InputTooLongError
    )
  })

  it('does not parse git words inside a value span', () => {
    const body = 'git '.repeat(3000)
    const input = `gh x --body "${body}"`
    const span = { start: 13, end: 13 + body.length }
    expect(scanGitWords(input, [span])).toBeNull()
    expect(
      scanGitWords('gh x -m "git pu\'sh\'"', [{ start: 9, end: 19 }])
    ).toBeNull()
  })
})
