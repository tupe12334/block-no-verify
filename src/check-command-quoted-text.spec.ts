import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

describe('checkCommand: override text inside message values (#93)', () => {
  describe('allows', () => {
    it.each([
      'git commit -m "fix LEFTHOOK=0 bypass"',
      "git commit -m 'document HUSKY=0 and LEFTHOOK_EXCLUDE=lint'",
      'git commit -m "skip with SKIP=eslint or OVERCOMMIT_DISABLE=1"',
      'git commit -m "block -c core.hooksPath=/dev/null overrides"',
      'git commit --message="fix LEFTHOOK=0 bypass"',
      'git commit -m x && gh pr create --title "x" --body "misses GIT_CONFIG_PARAMETERS= and core.hooksPath"',
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
      'git "-c" "core.hooksPath=/dev/null" commit -m "msg"',
      'git config core.hooksPath "/tmp/a b"',
      `GIT_CONFIG_PARAMETERS="'user.name'='x' 'core.hooksPath'='/dev/null'" git commit -m "msg"`,
      'GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/dev/null git commit -m "msg"',
      // Quoted shell payloads run, so they are never masked.
      'bash -c "git -c core.hooksPath=/dev/null commit -m x"',
      'bash -c "export HUSKY=0; git commit -m x"',
      "echo 'git -c core.hooksPath=/dev/null commit' | sh",
      // A command substitution in a message runs too.
      'git commit -m "$(HUSKY=0 git commit -m inner)"',
      // Only git and gh message values are masked: parallel -m runs its
      // next word through a shell.
      'parallel -m "git -c core.hooksPath=/dev/null commit -m x" ::: a',
      // A newline is not a statement boundary to the tokenizer.
      'git commit -m x\nparallel -m "git -c core.hooksPath=/dev/null commit" ::: a',
      'git commit -m x # c\nparallel -m "git -c core.hooksPath=/dev/null commit" ::: a',
      // ANSI-C quoting can hide a newline from the quote tracker.
      `git commit -m $'x\\''\nparallel -m "git -c core.hooksPath=/dev/null commit -m x" ::: a`,
      // An alias can run the message value in a shell.
      `git -c alias.x='!sh -c' x -m "git -c core.hooksPath=/dev/null commit"`,
      `gh alias set x '!sh -c' && gh x --body "export HUSKY=0; git commit -m y"`,
    ])('%s', command => {
      expect(checkCommand(command).blocked).toBe(true)
    })
  })
})
