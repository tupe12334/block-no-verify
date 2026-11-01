import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

const NV = '--no-' + 'verify'

// xargs runs its command with the piped text as arguments, so a bypass in
// that text is a bypass (#101).
describe('checkCommand: text piped into xargs', () => {
  it.each([
    `echo 'git commit -q -m x ${NV}' | xargs -I{} bash -c '{}'`,
    `echo 'git commit -q -m x ${NV}' | xargs -i sh -c '{}'`,
    `echo 'git commit -q -m x ${NV}' | xargs --replace bash -c '{}'`,
    `echo 'git commit -q -m x ${NV}' | xargs -I {} zsh -c "{}"`,
    `echo 'commit ${NV} -m x' | xargs git`,
    `printf 'commit ${NV}' | xargs git`,
    `echo 'commit -n -m x' | xargs git`,
    `echo 'commit ${NV}' | xargs -n1 git`,
    `echo 'commit ${NV}' | xargs -r -t git`,
    `echo 'git commit -m x ${NV}' | tee log | xargs -I{} sh -c '{}'`,
    `echo 'git commit -m x ${NV}' | xargs -I{} bash -c 'echo ok; {}'`,
  ])('blocks %s', input => {
    expect(checkCommand(input).blocked).toBe(true)
  })

  it.each([
    'echo a | xargs grep -n foo',
    'ls | xargs rm',
    "echo 'git commit -m x' | xargs git",
    "echo 'git commit -m x' | xargs -I{} bash -c '{}'",
    "echo 'file' | xargs -I{} cat {}",
    "echo 'git status' | xargs echo",
    'git log -1 | xargs -n1 echo',
  ])('allows %s', input => {
    expect(checkCommand(input).blocked).toBe(false)
  })
})
