import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// ssh runs the words after the destination as a command on the remote host,
// so a bypass inside them is a bypass (#101).
describe('checkCommand: ssh remote commands', () => {
  it.each([
    'ssh host "git push --no-verify"',
    "ssh host 'git commit -n -m x'",
    'ssh -p 22 me@host "git commit --no-verify -m x"',
    'ssh -p22 host "git push --no-verify"',
    'ssh -vp 22 host "git push --no-verify"',
    'ssh -o BatchMode=yes -- host "cd repo && git push --no-verify"',
    '/usr/bin/ssh host "HUSKY=0 git commit -m x"',
    'sudo ssh host "git push --no-verify"',
    'ssh host git commit --no-verify -m x',
  ])('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it.each([
    'ssh host "git push"',
    'ssh -p 22 host ls',
    'ssh host',
    'ssh host "echo --no-verify"',
    'eval "$(ssh-agent -s)"',
    'ssh-keygen -t ed25519 -n x',
  ])('allows %s', command => {
    expect(checkCommand(command).blocked).toBe(false)
  })
})
