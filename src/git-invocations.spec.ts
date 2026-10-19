import { describe, it, expect } from 'vitest'
import { findGitInvocations } from './git-invocations.js'

describe('findGitInvocations', () => {
  it('reads the sub-command and its arguments', () => {
    expect(findGitInvocations('git commit -m "a b"')).toEqual([
      { subcommand: 'commit', args: ['-m', 'a b'] },
    ])
  })

  it('skips git global options and their values', () => {
    expect(findGitInvocations('git -c a.b=c -C dir --no-pager ci -n')).toEqual([
      { subcommand: 'ci', args: ['-n'] },
    ])
  })

  it('reads one call per statement', () => {
    expect(findGitInvocations('git add . && /usr/bin/git push')).toEqual([
      { subcommand: 'add', args: ['.'] },
      { subcommand: 'push', args: [] },
    ])
  })

  it('ignores statements without git', () => {
    expect(findGitInvocations('echo hi && ls')).toEqual([])
  })
})
