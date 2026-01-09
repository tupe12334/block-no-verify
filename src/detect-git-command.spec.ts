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

  describe('absolute and relative paths to git', () => {
    it('should detect /usr/bin/git commit', () => {
      expect(detectGitCommand('/usr/bin/git commit -m "test"')).toBe('commit')
    })

    it('should detect /usr/local/bin/git commit', () => {
      expect(detectGitCommand('/usr/local/bin/git commit -m "test"')).toBe(
        'commit'
      )
    })

    it('should detect ./git commit (relative path)', () => {
      expect(detectGitCommand('./git commit -m "test"')).toBe('commit')
    })

    it('should detect ~/bin/git commit (home directory)', () => {
      expect(detectGitCommand('~/bin/git commit -m "test"')).toBe('commit')
    })

    it('should detect ../git commit (parent directory)', () => {
      expect(detectGitCommand('../git commit -m "test"')).toBe('commit')
    })
  })

  describe('command prefixes (sudo, env, etc.)', () => {
    it('should detect sudo git commit', () => {
      expect(detectGitCommand('sudo git commit -m "test"')).toBe('commit')
    })

    it('should detect sudo -u user git commit', () => {
      expect(detectGitCommand('sudo -u user git commit -m "test"')).toBe(
        'commit'
      )
    })

    it('should detect doas git commit', () => {
      expect(detectGitCommand('doas git commit -m "test"')).toBe('commit')
    })

    it('should detect env git commit', () => {
      expect(detectGitCommand('env git commit -m "test"')).toBe('commit')
    })

    it('should detect command git commit (shell builtin)', () => {
      expect(detectGitCommand('command git commit -m "test"')).toBe('commit')
    })

    it('should detect builtin git commit', () => {
      expect(detectGitCommand('builtin git commit -m "test"')).toBe('commit')
    })

    it('should detect exec git commit', () => {
      expect(detectGitCommand('exec git commit -m "test"')).toBe('commit')
    })

    it('should detect nohup git commit', () => {
      expect(detectGitCommand('nohup git commit -m "test"')).toBe('commit')
    })

    it('should detect time git commit', () => {
      expect(detectGitCommand('time git commit -m "test"')).toBe('commit')
    })

    it('should detect nice git commit', () => {
      expect(detectGitCommand('nice git commit -m "test"')).toBe('commit')
    })

    it('should detect strace git commit', () => {
      expect(detectGitCommand('strace git commit -m "test"')).toBe('commit')
    })
  })

  describe('environment variable prefixes', () => {
    it('should detect GIT_DIR=/path git commit', () => {
      expect(detectGitCommand('GIT_DIR=/path git commit -m "test"')).toBe(
        'commit'
      )
    })

    it('should detect VAR=value git commit', () => {
      expect(detectGitCommand('VAR=value git commit -m "test"')).toBe('commit')
    })

    it('should detect multiple env vars before git', () => {
      expect(detectGitCommand('FOO=bar BAZ=qux git commit -m "test"')).toBe(
        'commit'
      )
    })

    it('should detect GIT_AUTHOR_NAME="Name" git commit', () => {
      expect(
        detectGitCommand('GIT_AUTHOR_NAME="Name" git commit -m "test"')
      ).toBe('commit')
    })
  })

  describe('comments (should NOT match)', () => {
    it('should NOT detect commented out git commit with #', () => {
      expect(detectGitCommand('# git commit -m "test"')).toBeNull()
    })

    it('should NOT detect git commit in inline comment', () => {
      expect(detectGitCommand('echo hello # git commit')).toBeNull()
    })

    it('should detect git commit followed by comment', () => {
      expect(detectGitCommand('git commit -m "test" # comment')).toBe('commit')
    })
  })

  describe('negation and special operators', () => {
    it('should detect ! git commit (negation)', () => {
      expect(detectGitCommand('! git commit -m "test"')).toBe('commit')
    })

    it('should detect git commit with stdout redirect', () => {
      expect(detectGitCommand('git commit -m "test" > /dev/null')).toBe(
        'commit'
      )
    })

    it('should detect git commit with stderr redirect', () => {
      expect(detectGitCommand('git commit -m "test" 2>&1')).toBe('commit')
    })

    it('should detect git commit with combined redirect', () => {
      expect(detectGitCommand('git commit -m "test" &>/dev/null')).toBe(
        'commit'
      )
    })
  })

  describe('newline as command separator', () => {
    it('should detect git commit after newline', () => {
      expect(detectGitCommand('echo hello\ngit commit -m "test"')).toBe(
        'commit'
      )
    })

    it('should detect git commit with newline in multiline string', () => {
      expect(detectGitCommand('first command\nsecond\ngit commit')).toBe(
        'commit'
      )
    })
  })

  describe('quoted git commands', () => {
    it('should detect double-quoted "git" commit', () => {
      expect(detectGitCommand('"git" commit -m "test"')).toBe('commit')
    })

    it("should detect single-quoted 'git' commit", () => {
      expect(detectGitCommand("'git' commit -m 'test'")).toBe('commit')
    })
  })

  describe('Windows-style commands', () => {
    it('should detect git.exe commit', () => {
      expect(detectGitCommand('git.exe commit -m "test"')).toBe('commit')
    })

    it('should detect C:\\Program Files\\Git\\git.exe commit', () => {
      expect(
        detectGitCommand('C:\\Program Files\\Git\\git.exe commit -m "test"')
      ).toBe('commit')
    })
  })

  describe('xargs and complex piping', () => {
    it('should detect git commit piped to tee', () => {
      expect(detectGitCommand('git commit -m "test" | tee log.txt')).toBe(
        'commit'
      )
    })

    it('should detect git commit piped to grep', () => {
      expect(detectGitCommand('git commit -m "test" 2>&1 | grep error')).toBe(
        'commit'
      )
    })
  })

  describe('conditional execution', () => {
    it('should detect git commit after bash conditional', () => {
      expect(detectGitCommand('[[ -d .git ]] && git commit -m "test"')).toBe(
        'commit'
      )
    })

    it('should detect git commit after test command', () => {
      expect(detectGitCommand('test -d .git && git commit -m "test"')).toBe(
        'commit'
      )
    })

    it('should detect git commit after [ ] conditional', () => {
      expect(detectGitCommand('[ -d .git ] && git commit -m "test"')).toBe(
        'commit'
      )
    })
  })

  describe('SSH and remote execution', () => {
    it('should detect git commit in ssh command', () => {
      expect(detectGitCommand('ssh server "git commit -m test"')).toBe('commit')
    })

    it('should detect git commit in ssh with single quotes', () => {
      expect(detectGitCommand("ssh server 'git commit -m test'")).toBe('commit')
    })
  })

  describe('watch and repeat commands', () => {
    it('should detect git commit in watch command', () => {
      expect(detectGitCommand('watch -n 1 git commit -m "test"')).toBe('commit')
    })

    it('should detect git push in watch command', () => {
      expect(detectGitCommand('watch git push origin main')).toBe('push')
    })
  })

  describe('script interpreters', () => {
    it('should detect git commit in bash -c', () => {
      expect(detectGitCommand('bash -c "git commit -m test"')).toBe('commit')
    })

    it('should detect git commit in sh -c', () => {
      expect(detectGitCommand('sh -c "git commit -m test"')).toBe('commit')
    })

    it('should detect git commit in zsh -c', () => {
      expect(detectGitCommand('zsh -c "git commit -m test"')).toBe('commit')
    })
  })
})
