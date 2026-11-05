import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

const NV = '--no-' + 'verify'
const N = '-' + 'n'

describe('checkCommand: code bash runs through variable names (#152)', () => {
  describe('blocks', () => {
    it.each([
      // bash expands $(…) in a printf -v subscript before it checks the name.
      `printf -v 'a[$(git commit ${N} -m y)]' x`,
      `printf -v "a[\\$(git commit ${N} -m y)]" x`,
      `printf -v 'a[\`git commit ${NV} -m y\`]' x`,
      `printf '-va[$(git commit ${N} -m y)]' x`,
      // A BASH_CMDS or BASH_ALIASES write can make a later program a shell.
      `printf -v 'BASH_CMDS[grep]' /bin/sh; echo x | grep -c 'git commit ${N} -m y'`,
      `BASH_CMDS[grep]=/bin/sh; echo x | grep -c 'git commit ${N} -m y'`,
      `declare 'BASH_CMDS[cat]=/bin/sh'; cat -c 'git commit ${NV} -m y'`,
      `BASH_ALIASES[ls]='sh -c'; ls 'git commit ${N} -m y'`,
    ])('%s', command => {
      expect(checkCommand(command).blocked).toBe(true)
    })
  })

  describe('allows', () => {
    it.each([
      `printf -v name '%s' x; git commit -m "$name"`,
      `printf -v 'arr[0]' '%s' x; git commit -m x`,
      `printf -v 'BASH_CMDS[grep]' /bin/sh; grep -c 'git commit -m y' f`,
      `echo x | grep -c 'git commit ${N} -m y'`,
    ])('%s', command => {
      expect(checkCommand(command).blocked).toBe(false)
    })
  })
})
