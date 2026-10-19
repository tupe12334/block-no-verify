import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// A shell -c operand is a command the shell runs, so a bypass inside it is a
// bypass (#101).
describe('checkCommand: sh/bash -c command strings', () => {
  it.each([
    'bash -c "git commit --no-verify -m x"',
    "sh -c 'git push --no-verify'",
    'bash -lc "cd repo && git commit -n -m x"',
    'sudo bash -c "HUSKY=0 git commit -m x"',
    `bash -c "bash -c 'git commit --no-verify -m x'"`,
    `git -c alias.x='!sh -c "git commit --no-verify -m y"' x`,
    // Option words between -c and the script.
    'sh -c -- "git commit --no-verify -m x"',
    'bash -c -x "git commit --no-verify -m x"',
    'bash -c +e "git push --no-verify"',
  ])('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it.each([
    'bash -c "git commit -m x"',
    "sh -c 'npm test && git push'",
    'bash -c "echo --no-verify"',
    'bash script.sh --no-verify',
  ])('allows %s', command => {
    expect(checkCommand(command).blocked).toBe(false)
  })
})
