import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// Built at runtime so the source never holds a literal bypass command.
const N = '-' + 'n'
const NV = '--no-' + 'verify'

describe('checkCommand: &> and &>> redirects', () => {
  // bash reads `&> file` as one redirect, so the words after the file name are
  // still arguments of the same git command. shell-quote before 1.12.0 split
  // `&>` into a background `&` and a `>`, which moved those words into a new
  // statement with no git in it.
  it.each([
    `git commit -m x &> out ${N}`,
    `git commit -m x &>out ${N}`,
    `git commit -m x &>> out ${N}`,
    `git commit -m x &> out ${NV}`,
    `git push origin main &> log ${NV}`,
  ])('blocks a skip flag after an &> redirect: %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it('allows a plain commit with an &> redirect', () => {
    expect(checkCommand('git commit -m x &> out').blocked).toBe(false)
  })
})
