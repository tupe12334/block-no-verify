import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// A git alias runs its value, so an alias that carries a bypass is a
// bypass (#91).
describe('checkCommand: git aliases', () => {
  describe('blocks', () => {
    it.each([
      'git -c alias.ci="commit --no-verify" ci -m x',
      'git -c alias.ci="commit -n" ci -m x',
      "git -c 'alias.p=push --no-verify' p",
      'git config alias.ci "commit --no-verify" && git ci -m x',
      'git config --global alias.ci "commit --no-verify"',
      'git config --file .gitconfig alias.ci "commit --no-verify"',
      `git -c alias.x='!git commit --no-verify -m y' x`,
      `git -c alias.x='!HUSKY=0 git commit -m y' x`,
      // The flag added at the call, or through an alias chain.
      'git -c alias.x=commit x --no-verify -m y',
      'git -c alias.x=commit x -n -m y',
      'git config alias.ci commit && git ci -n -m y',
      `git -c alias.x=commit -c alias.y='!git x --no-verify' y`,
      // An alias defined elsewhere: unknown sub-command plus the flag.
      'git ci --no-verify -m y',
    ])('%s', command => {
      const result = checkCommand(command)
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain('alias')
    })
  })

  it('blocks an alias that overrides the hooks path', () => {
    expect(
      checkCommand('git -c alias.c="-c core.hooksPath=/dev/null commit" c')
        .blocked
    ).toBe(true)
  })

  describe('allows', () => {
    it.each([
      'git -c alias.co=checkout co main',
      'git config alias.st status',
      'git config --global alias.lg "log --graph"',
      `git -c alias.x='!echo hi' x`,
      'git commit -m "alias.ci=commit --no-verify"',
      'echo alias.ci "commit --no-verify"',
    ])('%s', command => {
      expect(checkCommand(command).blocked).toBe(false)
    })
  })
})
