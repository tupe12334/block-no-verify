import { describe, it, expect } from 'vitest'
import { dropRedirectTargets } from './drop-redirect-targets.js'
import { tokenizeCommand } from './tokenize-command.js'

describe('dropRedirectTargets', () => {
  it('removes the file operand of a > redirect', () => {
    expect(
      dropRedirectTargets(tokenizeCommand('git commit -m safe > log.txt'))
    ).toEqual(['git', 'commit', '-m', 'safe', { op: '>' }])
  })

  it('removes a redirect target that looks like a flag', () => {
    expect(
      dropRedirectTargets(tokenizeCommand('git commit -m safe > --no-verify'))
    ).toEqual(['git', 'commit', '-m', 'safe', { op: '>' }])
  })

  it('removes the operand of a 2> redirect and keeps the fd word', () => {
    expect(
      dropRedirectTargets(tokenizeCommand('git commit -m safe 2> --no-verify'))
    ).toEqual(['git', 'commit', '-m', 'safe', '2', { op: '>' }])
  })

  it('keeps a plain argument that follows a redirect-free command', () => {
    expect(
      dropRedirectTargets(tokenizeCommand('git commit --no-verify -m x'))
    ).toEqual(['git', 'commit', '--no-verify', '-m', 'x'])
  })

  it('keeps an argument that follows a non-redirect operator', () => {
    expect(
      dropRedirectTargets(tokenizeCommand('git status | grep --no-verify'))
    ).toEqual(['git', 'status', { op: '|' }, 'grep', '--no-verify'])
  })
})
