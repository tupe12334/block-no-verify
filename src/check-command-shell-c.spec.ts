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
    // Other shells run their -c operand too.
    'ash -c "git commit --no-verify -m x"',
    'fish -c "git commit --no-verify -m x"',
    '/bin/tcsh -c "git commit --no-verify -m x"',
    // eval and env -S run their operand as a command line.
    'eval "git commit --no-verify -m x"',
    'eval git commit --no-verify -m x',
    'env -S "git commit --no-verify -m x"',
    'env --split-string="git push --no-verify"',
    '/usr/bin/env -S "git commit --no-verify -m x"',
    'env -iS "git commit --no-verify -m x"',
    'env -S"git commit --no-verify -m x"',
    "env -S 'git\\_commit\\_--no-verify\\_-m\\_x'",
    "env -S '-i git commit --no-verify -m x'",
  ])('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it.each([
    'bash -c "git commit -m x"',
    "sh -c 'npm test && git push'",
    'bash -c "echo --no-verify"',
    'bash script.sh --no-verify',
    'eval "$(ssh-agent -s)"',
    'env -S "git status"',
    'echo eval',
  ])('allows %s', command => {
    expect(checkCommand(command).blocked).toBe(false)
  })
})
