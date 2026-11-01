import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// Built at runtime so the source never holds a literal bypass command.
const N = '-' + 'n'
const NV = '--no-' + 'verify'

describe('checkCommand: a skip flag passed through a here-string', () => {
  // A here-string word is stdin text. `read` or `cat` turns it into an
  // argument of git, so it must not be dropped like a redirect file name.
  // Each case committed past a failing pre-commit hook in real git.
  it.each([
    `read -r a <<< ${NV}\ngit commit -m x $a`,
    `read -r a <<< ${N}\ngit commit -m x --allow-empty $a`,
    `git commit -m x --allow-empty $(cat <<< ${N})`,
    `git commit -m x --allow-empty $(cat <<< ${NV})`,
    `git commit -m x --allow-empty $(<<< ${NV} cat)`,
  ])('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })
})
