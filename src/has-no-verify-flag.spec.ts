import { describe, it, expect } from 'vitest'
import { hasNoVerifyFlag } from './has-no-verify-flag.js'

describe('hasNoVerifyFlag', () => {
  describe('--no-verify flag', () => {
    it('should detect --no-verify in commit', () => {
      expect(
        hasNoVerifyFlag('git commit --no-verify -m "test"', 'commit')
      ).toBe(true)
    })

    it('should detect --no-verify in push', () => {
      expect(hasNoVerifyFlag('git push --no-verify origin main', 'push')).toBe(
        true
      )
    })

    it('should detect --no-verify in merge', () => {
      expect(hasNoVerifyFlag('git merge --no-verify feature', 'merge')).toBe(
        true
      )
    })

    it('should detect --no-verify in cherry-pick', () => {
      expect(
        hasNoVerifyFlag('git cherry-pick --no-verify abc123', 'cherry-pick')
      ).toBe(true)
    })

    it('should detect --no-verify in rebase', () => {
      expect(hasNoVerifyFlag('git rebase --no-verify main', 'rebase')).toBe(
        true
      )
    })

    it('should detect --no-verify in am', () => {
      expect(hasNoVerifyFlag('git am --no-verify < patch', 'am')).toBe(true)
    })

    it('should detect --no-verify at end of command', () => {
      expect(
        hasNoVerifyFlag('git commit -m "test" --no-verify', 'commit')
      ).toBe(true)
    })

    it('should not match --no-verify as part of another word', () => {
      expect(hasNoVerifyFlag('git commit -m "--no-verifytest"', 'commit')).toBe(
        false
      )
    })
  })

  describe('-n shorthand for commit', () => {
    it('should detect -n in git commit', () => {
      expect(hasNoVerifyFlag('git commit -n -m "test"', 'commit')).toBe(true)
    })

    it('should detect -n at end of commit command', () => {
      expect(hasNoVerifyFlag('git commit -m "test" -n', 'commit')).toBe(true)
    })

    it('should detect -nm combined flags', () => {
      expect(hasNoVerifyFlag('git commit -nm "test"', 'commit')).toBe(true)
    })

    it('should NOT detect -n in git push (different meaning)', () => {
      expect(hasNoVerifyFlag('git push -n origin main', 'push')).toBe(false)
    })

    it('should NOT detect -n in git merge (different meaning)', () => {
      expect(hasNoVerifyFlag('git merge -n feature', 'merge')).toBe(false)
    })

    it('should NOT detect -n in git cherry-pick (different meaning)', () => {
      expect(hasNoVerifyFlag('git cherry-pick -n abc123', 'cherry-pick')).toBe(
        false
      )
    })

    it('should NOT detect -n in git rebase (different meaning)', () => {
      expect(hasNoVerifyFlag('git rebase -n main', 'rebase')).toBe(false)
    })
  })

  describe('commands without --no-verify', () => {
    it('should return false for commit without --no-verify', () => {
      expect(hasNoVerifyFlag('git commit -m "test"', 'commit')).toBe(false)
    })

    it('should return false for push without --no-verify', () => {
      expect(hasNoVerifyFlag('git push origin main', 'push')).toBe(false)
    })

    it('should return false for merge without --no-verify', () => {
      expect(hasNoVerifyFlag('git merge feature', 'merge')).toBe(false)
    })
  })
})
