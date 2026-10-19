import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

describe('checkCommand: override text inside quoted free text (#93)', () => {
  describe('allows', () => {
    it.each([
      'git commit -m "fix LEFTHOOK=0 bypass"',
      "git commit -m 'document HUSKY=0 and LEFTHOOK_EXCLUDE=lint'",
      'git commit -m "skip with SKIP=eslint or OVERCOMMIT_DISABLE=1"',
      'git commit -m "block -c core.hooksPath=/dev/null overrides"',
      'git commit -m x && gh pr create --body "misses GIT_CONFIG_PARAMETERS= and core.hooksPath"',
      'git config user.name "Jane Doe" && echo "core.hooksPath is case-sensitive here"',
    ])('%s', command => {
      expect(checkCommand(command).blocked).toBe(false)
    })
  })

  describe('still blocks', () => {
    it.each([
      'LEFTHOOK=0 git commit -m "msg"',
      'LEFTHOOK="0" git commit -m "msg"',
      'HUSKY=0 git commit -m "fix LEFTHOOK=0 bypass"',
      'export LEFTHOOK=0 && git commit -m "msg"',
      'LEFTHOOK_EXCLUDE="lint test" git commit -m "msg"',
      'git -c core.hooksPath=/dev/null commit -m "msg"',
      'git -c "core.hooksPath=/dev/null" commit -m "msg"',
      'git -c "core.hooksPath=/dev/null " commit -m "msg"',
      'git config core.hooksPath "/tmp/a b"',
      `GIT_CONFIG_PARAMETERS="'user.name'='x' 'core.hooksPath'='/dev/null'" git commit -m "msg"`,
      'GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/dev/null git commit -m "msg"',
    ])('%s', command => {
      expect(checkCommand(command).blocked).toBe(true)
    })
  })
})
