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

  describe('--no-verify inside a quoted message value (false positives)', () => {
    it('should NOT match --no-verify inside a commit -m message body', () => {
      expect(
        hasNoVerifyFlag(
          'git commit -m "chore: guard against --no-verify bypass"',
          'commit'
        )
      ).toBe(false)
    })

    it('should NOT match --no-verify mentioned in a -m message about push', () => {
      expect(
        hasNoVerifyFlag(
          'git commit -m "docs: mention git push --no-verify in README"',
          'commit'
        )
      ).toBe(false)
    })

    it('should NOT match --no-verify inside a heredoc command substitution', () => {
      const input = [
        `git commit -m "$(cat <<'EOF'`,
        'chore: add block-no-verify to guard git hooks',
        '',
        'Blocks the --no-verify flag so hooks cannot be bypassed.',
        'EOF',
        ')"',
      ].join('\n')
      expect(hasNoVerifyFlag(input, 'commit')).toBe(false)
    })

    it('should NOT match --no-verify inside an unquoted heredoc body', () => {
      const input = [
        'git commit -F - <<EOF',
        'explain the --no-verify guard',
        'EOF',
      ].join('\n')
      expect(hasNoVerifyFlag(input, 'commit')).toBe(false)
    })

    it('should NOT match -n tokens inside a -m message body', () => {
      expect(
        hasNoVerifyFlag('git commit -m "kubectl logs -n kube-system"', 'commit')
      ).toBe(false)
    })

    it('should NOT match -n<word> inside a -m message body', () => {
      expect(
        hasNoVerifyFlag('git commit -m "the -nebula network"', 'commit')
      ).toBe(false)
    })

    it('should still detect a quoted --no-verify in flag position', () => {
      expect(hasNoVerifyFlag('git commit "--no-verify"', 'commit')).toBe(true)
    })
  })

  describe('flags belonging to another command in a compound line', () => {
    it('should NOT match -n that belongs to git log after &&', () => {
      expect(
        hasNoVerifyFlag(
          'git commit --no-edit && git log --oneline -n 3',
          'commit'
        )
      ).toBe(false)
    })

    it('should NOT match -n that belongs to kubectl after &&', () => {
      expect(
        hasNoVerifyFlag(
          'git commit -m "x" && kubectl logs -n kube-system',
          'commit'
        )
      ).toBe(false)
    })

    it('should NOT match -n belonging to git log after ;', () => {
      expect(hasNoVerifyFlag('git commit -m x ; git log -n 3', 'commit')).toBe(
        false
      )
    })

    it('should NOT match -n belonging to git log on the next line', () => {
      expect(hasNoVerifyFlag('git commit -m x\ngit log -n 3', 'commit')).toBe(
        false
      )
    })

    it('should NOT match -n belonging to a piped command', () => {
      expect(hasNoVerifyFlag('git commit -m x | head -n 3', 'commit')).toBe(
        false
      )
    })

    it('should NOT match --no-verify belonging to another command', () => {
      expect(
        hasNoVerifyFlag('echo "--no-verify" && git commit -m x', 'commit')
      ).toBe(false)
    })

    it('should still detect -n on the git commit segment of a compound line', () => {
      expect(hasNoVerifyFlag('ls && git commit -n -m x', 'commit')).toBe(true)
    })

    it('should still detect --no-verify after a leading command', () => {
      expect(
        hasNoVerifyFlag('ls && git commit --no-verify -m x', 'commit')
      ).toBe(true)
    })

    it('should detect -n inside a command substitution', () => {
      expect(hasNoVerifyFlag('echo $(git commit -n)', 'commit')).toBe(true)
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
