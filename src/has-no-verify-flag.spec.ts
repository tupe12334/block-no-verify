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

  describe('false positives from message bodies (issues #1, #5, #9)', () => {
    it('should NOT match -n inside -m message body (find -name)', () => {
      expect(
        hasNoVerifyFlag('git commit -m "find scripts -name \'*.sh\'"', 'commit')
      ).toBe(false)
    })

    it('should NOT match kubectl -n namespace inside message body', () => {
      expect(
        hasNoVerifyFlag('git commit -m "kubectl logs -n kube-system"', 'commit')
      ).toBe(false)
    })

    it('should NOT match arbitrary -n<word> inside message body', () => {
      expect(
        hasNoVerifyFlag('git commit -m "the -nebula network"', 'commit')
      ).toBe(false)
    })

    it('should NOT match --no-verify text inside -m message body', () => {
      expect(
        hasNoVerifyFlag(
          'git commit -m "chore: guard against the --no-verify bypass"',
          'commit'
        )
      ).toBe(false)
    })

    it('should NOT match --no-verify inside a multi-line -m message body', () => {
      const input =
        'git commit -m "chore: add block-no-verify\n\nblock-no-verify prevents agents from bypassing hooks via the --no-verify flag"'
      expect(hasNoVerifyFlag(input, 'commit')).toBe(false)
    })

    it('should NOT match --no-verify inside a heredoc message substitution', () => {
      const input =
        'git commit -m "$(cat <<\'EOF\'\nchore: add block-no-verify\n\nBlocks the --no-verify flag so hooks cannot be bypassed.\nEOF\n)"'
      expect(hasNoVerifyFlag(input, 'commit')).toBe(false)
    })

    it('should still block a quoted --no-verify flag in flag position', () => {
      expect(hasNoVerifyFlag('git commit "--no-verify"', 'commit')).toBe(true)
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
