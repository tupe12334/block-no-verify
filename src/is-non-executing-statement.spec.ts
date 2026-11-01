import { describe, it, expect } from 'vitest'
import { isNonExecutingStatement } from './is-non-executing-statement.js'

describe('isNonExecutingStatement', () => {
  it('treats an assignment-only statement as data', () => {
    expect(isNonExecutingStatement(['old=git commit -q -m x'])).toBe(true)
  })

  it('treats echo, printf, cat, tee and grep arguments as data', () => {
    expect(isNonExecutingStatement(['echo', 'git push --no-verify'])).toBe(true)
    expect(isNonExecutingStatement(['printf', '%s', 'eval'])).toBe(true)
    expect(isNonExecutingStatement(['grep', '-n', 'needle', 'file'])).toBe(true)
    expect(isNonExecutingStatement(['/bin/cat', 'x'])).toBe(true)
  })

  it('treats command -v and command -pV lookups as data', () => {
    expect(isNonExecutingStatement(['command', '-v', 'git', 'push'])).toBe(true)
    expect(isNonExecutingStatement(['command', '-pV', 'git', 'commit'])).toBe(
      true
    )
  })

  it('treats a command call that runs its name as executing', () => {
    expect(isNonExecutingStatement(['command', 'git', 'commit'])).toBe(false)
    expect(isNonExecutingStatement(['command', '-p', 'git'])).toBe(false)
  })

  it('treats bash, git and eval as executing', () => {
    expect(isNonExecutingStatement(['bash', '-n', 's.sh'])).toBe(false)
    expect(isNonExecutingStatement(['git', 'commit'])).toBe(false)
    expect(isNonExecutingStatement(['eval', 'git commit'])).toBe(false)
  })

  it('skips leading assignments to find the program', () => {
    expect(isNonExecutingStatement(['GIT_X=1', 'echo', 'hi'])).toBe(true)
    expect(isNonExecutingStatement(['GIT_X=1', 'git', 'commit'])).toBe(false)
  })
})
