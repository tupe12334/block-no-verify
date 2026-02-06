import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

describe('checkCommand', () => {
  describe('blocking commands', () => {
    it('should block git commit --no-verify', () => {
      const result = checkCommand('git commit --no-verify -m "test"')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('commit')
      expect(result.reason).toContain('BLOCKED')
      expect(result.reason).toContain('--no-verify')
    })

    it('should block git push --no-verify', () => {
      const result = checkCommand('git push --no-verify origin main')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('push')
    })

    it('should block git commit -n', () => {
      const result = checkCommand('git commit -n -m "test"')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('commit')
    })

    it('should block git merge --no-verify', () => {
      const result = checkCommand('git merge --no-verify feature')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('merge')
    })

    it('should block git cherry-pick --no-verify', () => {
      const result = checkCommand('git cherry-pick --no-verify abc123')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('cherry-pick')
    })

    it('should block git rebase --no-verify', () => {
      const result = checkCommand('git rebase --no-verify main')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('rebase')
    })

    it('should block git am --no-verify', () => {
      const result = checkCommand('git am --no-verify < patch')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('am')
    })
  })

  describe('allowing commands', () => {
    it('should allow git commit without --no-verify', () => {
      const result = checkCommand('git commit -m "test"')
      expect(result.blocked).toBe(false)
      expect(result.gitCommand).toBe('commit')
    })

    it('should allow git push without --no-verify', () => {
      const result = checkCommand('git push origin main')
      expect(result.blocked).toBe(false)
      expect(result.gitCommand).toBe('push')
    })

    it('should allow non-git commands', () => {
      const result = checkCommand('npm install')
      expect(result.blocked).toBe(false)
      expect(result.gitCommand).toBeUndefined()
    })

    it('should allow git status', () => {
      const result = checkCommand('git status')
      expect(result.blocked).toBe(false)
      expect(result.gitCommand).toBeUndefined()
    })

    it('should allow empty input', () => {
      const result = checkCommand('')
      expect(result.blocked).toBe(false)
    })

    it('should allow git push -n (dry-run, not --no-verify)', () => {
      const result = checkCommand('git push -n origin main')
      expect(result.blocked).toBe(false)
      expect(result.gitCommand).toBe('push')
    })
  })

  describe('blocking hooks path override', () => {
    it('should block git -c core.hooksPath=/dev/null push', () => {
      const result = checkCommand('git -c core.hooksPath=/dev/null push')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('push')
      expect(result.reason).toContain('BLOCKED')
      expect(result.reason).toContain('core.hooksPath')
    })

    it('should block git -c core.hooksPath=/dev/null commit', () => {
      const result = checkCommand(
        'git -c core.hooksPath=/dev/null commit -m "test"'
      )
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('commit')
    })

    it('should block git -c core.hooksPath= push (empty value)', () => {
      const result = checkCommand('git -c core.hooksPath= push origin main')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('push')
    })

    it('should block git -c "core.hooksPath=/dev/null" push', () => {
      const result = checkCommand('git -c "core.hooksPath=/dev/null" push')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('push')
    })
  })

  describe('edge cases', () => {
    it('should handle command chains with --no-verify', () => {
      const result = checkCommand('ls && git commit --no-verify -m "test"')
      expect(result.blocked).toBe(true)
    })

    it('should handle commands with extra whitespace', () => {
      const result = checkCommand('git    commit    --no-verify -m "test"')
      expect(result.blocked).toBe(true)
    })

    it('should handle git -C flag with --no-verify', () => {
      const result = checkCommand('git -C /path commit --no-verify -m "test"')
      expect(result.blocked).toBe(true)
    })
  })
})
