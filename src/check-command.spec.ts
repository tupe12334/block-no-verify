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

    it('should block git config core.hooksPath <value> even though "config" is not a --no-verify-capable sub-command', () => {
      const result = checkCommand('git config core.hooksPath /tmp/empty')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBeUndefined()
      expect(result.reason).toContain('BLOCKED')
      expect(result.reason).toContain('core.hooksPath')
    })

    it('should block git config --global core.hooksPath <value>', () => {
      const result = checkCommand(
        'git config --global core.hooksPath /dev/null'
      )
      expect(result.blocked).toBe(true)
    })

    it('should allow a bare read of git config core.hooksPath', () => {
      const result = checkCommand('git config core.hooksPath')
      expect(result.blocked).toBe(false)
    })
  })

  describe('blocking HUSKY=0 override', () => {
    it('should block HUSKY=0 git commit', () => {
      const result = checkCommand('HUSKY=0 git commit -m "test"')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('commit')
      expect(result.reason).toContain('BLOCKED')
      expect(result.reason).toContain('HUSKY=0')
    })

    it('should block HUSKY=0 git push', () => {
      const result = checkCommand('HUSKY=0 git push origin main')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('push')
    })

    it('should block export HUSKY=0 before commit', () => {
      const result = checkCommand('export HUSKY=0; git commit -m "test"')
      expect(result.blocked).toBe(true)
      expect(result.gitCommand).toBe('commit')
    })

    it('should not block HUSKY=1 git commit', () => {
      const result = checkCommand('HUSKY=1 git commit -m "test"')
      expect(result.blocked).toBe(false)
      expect(result.gitCommand).toBe('commit')
    })
  })

  describe('blocking GitHub MCP tools', () => {
    it('should block mcp__github__push_files', () => {
      const result = checkCommand('', {
        toolName: 'mcp__github__push_files',
      })
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain('BLOCKED')
      expect(result.reason).toContain('mcp__github__push_files')
      expect(result.reason).toContain('bypass')
    })

    it('should block mcp__github__create_or_update_file', () => {
      const result = checkCommand('', {
        toolName: 'mcp__github__create_or_update_file',
      })
      expect(result.blocked).toBe(true)
    })

    it('should block mcp__github__delete_file', () => {
      const result = checkCommand('', {
        toolName: 'mcp__github__delete_file',
      })
      expect(result.blocked).toBe(true)
    })

    it('should block mcp__github__merge_pull_request', () => {
      const result = checkCommand('', {
        toolName: 'mcp__github__merge_pull_request',
      })
      expect(result.blocked).toBe(true)
    })

    it('should block mcp__github__update_pull_request_branch', () => {
      const result = checkCommand('', {
        toolName: 'mcp__github__update_pull_request_branch',
      })
      expect(result.blocked).toBe(true)
    })

    it('should allow read-only GitHub MCP tools', () => {
      const result = checkCommand('', {
        toolName: 'mcp__github__get_file_contents',
      })
      expect(result.blocked).toBe(false)
    })

    it('should allow unrelated MCP tools', () => {
      const result = checkCommand('', {
        toolName: 'mcp__other__push_files',
      })
      expect(result.blocked).toBe(false)
    })

    it('should still work when options is omitted (backwards compatible)', () => {
      const result = checkCommand('git commit -m "test"')
      expect(result.blocked).toBe(false)
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

  describe('issue #56: bypass detection gaps', () => {
    describe('group A: sub-command detection evasion via quotes/variables', () => {
      it('should block git "push" --no-verify (quoted sub-command)', () => {
        const result = checkCommand('git "push" --no-verify origin main')
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('push')
      })

      it('should block git pu"sh" --no-verify (sub-command split by double quotes)', () => {
        const result = checkCommand('git pu"sh" --no-verify origin main')
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('push')
      })

      it("should block git p'us'h --no-verify (sub-command split by single quotes)", () => {
        const result = checkCommand("git p'us'h --no-verify origin main")
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('push')
      })

      it('should block c=push; git $c --no-verify (sub-command via variable)', () => {
        const result = checkCommand('c=push; git $c --no-verify')
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('push')
      })

      it('should block g=git; $g push --no-verify (git itself via variable)', () => {
        const result = checkCommand('g=git; $g push --no-verify')
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('push')
      })
    })

    describe('group B: --no-verify abbreviation', () => {
      it('should block git push --no-veri origin main', () => {
        const result = checkCommand('git push --no-veri origin main')
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('push')
      })

      it('should block git commit --no-veri -m "msg"', () => {
        const result = checkCommand('git commit --no-veri -m "msg"')
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('commit')
      })
    })

    describe('group C: core.hooksPath via environment config injection', () => {
      it('should block GIT_CONFIG_KEY_0/VALUE_0=core.hooksPath', () => {
        const result = checkCommand(
          'GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/dev/null git push'
        )
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('push')
      })

      it('should block GIT_CONFIG_PARAMETERS with core.hooksPath', () => {
        const result = checkCommand(
          'GIT_CONFIG_PARAMETERS="\'core.hooksPath=/dev/null\'" git push'
        )
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('push')
      })
    })

    describe('group D: hook-manager coverage beyond husky', () => {
      it('should block LEFTHOOK=0 git push', () => {
        const result = checkCommand('LEFTHOOK=0 git push origin main')
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('push')
        expect(result.reason).toContain('LEFTHOOK=0')
      })

      it('should block OVERCOMMIT_DISABLE=1 git push', () => {
        const result = checkCommand('OVERCOMMIT_DISABLE=1 git push origin main')
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('push')
        expect(result.reason).toContain('OVERCOMMIT_DISABLE=1')
      })

      it('should block SKIP=pre-push git push', () => {
        const result = checkCommand('SKIP=pre-push git push origin main')
        expect(result.blocked).toBe(true)
        expect(result.gitCommand).toBe('push')
        expect(result.reason).toContain('SKIP')
      })
    })

    describe('controls: legitimate commands that must stay allowed', () => {
      it('should allow git commit -m "fix core.hooksPath= issue"', () => {
        const result = checkCommand('git commit -m "fix core.hooksPath= issue"')
        expect(result.blocked).toBe(false)
      })

      it('should allow git push -n origin main (dry-run)', () => {
        const result = checkCommand('git push -n origin main')
        expect(result.blocked).toBe(false)
      })

      it('should allow HUSKY=1 git commit -m x (hooks enabled)', () => {
        const result = checkCommand('HUSKY=1 git commit -m x')
        expect(result.blocked).toBe(false)
      })
    })
  })

  describe('command substitution nested inside double quotes (issue #81)', () => {
    it('should block --no-verify inside a $(...) substitution in double quotes', () => {
      const result = checkCommand('echo "$(git commit --no-verify)"')
      expect(result.blocked).toBe(true)
    })

    it('should block --no-verify inside a backtick substitution in double quotes', () => {
      const result = checkCommand('echo "`git commit --no-verify`"')
      expect(result.blocked).toBe(true)
    })

    it('should block -n inside a $(...) substitution in double quotes', () => {
      const result = checkCommand('echo "$(git commit -n -m x)"')
      expect(result.blocked).toBe(true)
    })

    it('should block a substitution used as an assignment value', () => {
      const result = checkCommand('OUT="$(git commit --no-verify)"')
      expect(result.blocked).toBe(true)
    })
  })
})
