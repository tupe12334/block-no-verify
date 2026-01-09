import { describe, it, expect } from 'vitest'
import { detectGitCommand } from './detect-git-command.js'

describe('detectGitCommand', () => {
  describe('detecting git commit', () => {
    it('should detect git commit command', () => {
      expect(detectGitCommand('git commit -m "test"')).toBe('commit')
    })

    it('should detect git commit with -C flag', () => {
      expect(detectGitCommand('git -C /some/path commit -m "test"')).toBe(
        'commit'
      )
    })

    it('should detect git commit with multiple spaces', () => {
      expect(detectGitCommand('git    commit -m "test"')).toBe('commit')
    })
  })

  describe('detecting git push', () => {
    it('should detect git push command', () => {
      expect(detectGitCommand('git push origin main')).toBe('push')
    })
  })

  describe('detecting git merge', () => {
    it('should detect git merge command', () => {
      expect(detectGitCommand('git merge feature-branch')).toBe('merge')
    })
  })

  describe('detecting git cherry-pick', () => {
    it('should detect git cherry-pick command', () => {
      expect(detectGitCommand('git cherry-pick abc123')).toBe('cherry-pick')
    })
  })

  describe('detecting git rebase', () => {
    it('should detect git rebase command', () => {
      expect(detectGitCommand('git rebase main')).toBe('rebase')
    })
  })

  describe('detecting git am', () => {
    it('should detect git am command', () => {
      expect(detectGitCommand('git am < patch.patch')).toBe('am')
    })
  })

  describe('non-matching inputs', () => {
    it('should return null for non-git commands', () => {
      expect(detectGitCommand('npm install')).toBeNull()
    })

    it('should return null for empty input', () => {
      expect(detectGitCommand('')).toBeNull()
    })

    it('should return null for git status', () => {
      expect(detectGitCommand('git status')).toBeNull()
    })

    it('should return null for git log', () => {
      expect(detectGitCommand('git log')).toBeNull()
    })

    it('should return null for git diff', () => {
      expect(detectGitCommand('git diff')).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle commands in a chain', () => {
      expect(detectGitCommand('ls && git commit -m "test"')).toBe('commit')
    })

    it('should not match git as part of another word', () => {
      expect(detectGitCommand('digit commit')).toBeNull()
    })

    it('should not match commit as part of another word', () => {
      expect(detectGitCommand('git uncommitted')).toBeNull()
    })
  })

  describe('shell syntax edge cases', () => {
    it('should detect git commit in subshell $()', () => {
      expect(detectGitCommand('$(git commit -m "test")')).toBe('commit')
    })

    it('should detect git commit in backticks', () => {
      expect(detectGitCommand('`git commit -m "test"`')).toBe('commit')
    })

    it('should detect git commit after pipe', () => {
      expect(detectGitCommand('echo "y" | git commit -m "test"')).toBe('commit')
    })

    it('should detect git commit with here-doc', () => {
      expect(detectGitCommand('git commit -m <<EOF')).toBe('commit')
    })

    it('should detect git commit as background job', () => {
      expect(detectGitCommand('git commit -m "test" &')).toBe('commit')
    })

    it('should detect git push as background job', () => {
      expect(detectGitCommand('git push origin main &')).toBe('push')
    })

    it('should detect git commit after semicolon', () => {
      expect(detectGitCommand('cd /path; git commit -m "test"')).toBe('commit')
    })

    it('should detect git commit after || operator', () => {
      expect(detectGitCommand('false || git commit -m "test"')).toBe('commit')
    })

    it('should detect git commit in nested subshell', () => {
      expect(detectGitCommand('echo $(git commit -m "test")')).toBe('commit')
    })

    it('should detect git commit with process substitution', () => {
      expect(detectGitCommand('diff <(git commit -m "test")')).toBe('commit')
    })

    it('should detect git commit in command grouping with braces', () => {
      expect(detectGitCommand('{ git commit -m "test"; }')).toBe('commit')
    })

    it('should detect git commit in subshell with parentheses', () => {
      expect(detectGitCommand('(git commit -m "test")')).toBe('commit')
    })
  })
})
