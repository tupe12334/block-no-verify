import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

describe('checkCommand flag attribution', () => {
  describe('allows a flag that belongs to another statement', () => {
    it.each([
      'git commit -m x\nbash -n s.sh',
      'old="git commit -q -m x"; bash -n x.sh',
      'echo "git commit -q -m x"; grep -n needle file',
      "printf '%s' eval 'git commit --no-verify'",
      "echo 'git commit' --no-verify",
    ])('allows %j', command => {
      expect(checkCommand(command).blocked).toBe(false)
    })
  })

  describe('still blocks a bypass that a shell really runs', () => {
    it.each([
      "eval 'git commit --no-verify'",
      "bash -c 'git commit -n'",
      'echo "git commit -n" | bash',
      'git commit -m x\ngit push --no-verify',
      'bash -n s.sh\ngit commit --no-verify -m x',
      'cat <(git push --no-verify)',
    ])('blocks %j', command => {
      expect(checkCommand(command).blocked).toBe(true)
    })
  })
})
