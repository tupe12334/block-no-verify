import { describe, it, expect } from 'vitest'
import { detectGitCommand } from './detect-git-command.js'
import { findExecutedNoVerifyCommand } from './find-executed-no-verify.js'

/** Mirrors check-command: only a command with a detected git call is checked. */
const findExecuted = (input: string) => {
  const detected = detectGitCommand(input)
  return detected === null ? null : findExecutedNoVerifyCommand(input, detected)
}

describe('findExecutedNoVerifyCommand', () => {
  describe('allows a flag that belongs to another statement or to data', () => {
    it.each([
      'git commit -m x\nbash -n s.sh',
      'old="git commit -q -m x"; bash -n x.sh',
      'echo "git commit -q -m x"; grep -n needle file',
      "printf '%s' 'git commit -m x'; bash -n script.sh",
      "payload='git commit -m x'; grep --no-verify file",
      "echo 'git commit' --no-verify",
      'git commit -m x\n' + 'sed --no-verify file',
      'sed -n 1p f; echo "git commit -q"',
      'command -v git push --no-verify',
      'command -pV git commit --no-verify',
      'echo git commit -n',
      "bash -c 'echo ok' 'git push --no-verify'",
      "env --split-string='git\\_commit\\_--no-verify'",
    ])('allows %j', command => {
      expect(findExecuted(command)).toBeNull()
    })
  })

  describe('still blocks a real bypass in the same shape', () => {
    it.each([
      'git commit -m x\ngit push --no-verify',
      'echo ok\ngit commit -n',
      "echo 'x'; git commit --no-verify",
      'bash -n s.sh && git commit -n -m x',
      'eval "git commit" --no-verify',
      'eval "git" commit --no-verify',
      'g=git; $g commit -n',
      'command -v git; git commit -n',
      'command git commit --no-verify',
      '"git" commit -n',
      'echo "$(git commit --no-verify)"',
      'cat <(git push --no-verify)',
      "env --split-string='git commit' --no-verify -m x",
    ])('blocks %j', command => {
      expect(findExecuted(command)).not.toBeNull()
    })
  })

  it('reports the git sub-command that runs with the flag', () => {
    expect(findExecuted('echo hi\ngit push -n')).toBeNull()
    expect(findExecuted('echo hi\ngit push --no-verify')).toBe('push')
  })
})
