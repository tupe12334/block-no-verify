import type { TestCommand } from './test-command.js'

/** Commands that should be allowed (no --no-verify or hooks bypass) */
export const ALLOWED_COMMANDS: TestCommand[] = [
  // Normal git commands
  { command: 'git commit -m "test"', description: 'normal commit' },
  {
    command: 'git commit -m "feat: add feature"',
    description: 'commit with conventional message',
  },
  { command: 'git push origin main', description: 'normal push' },
  { command: 'git push -u origin feature', description: 'push with upstream' },
  { command: 'git merge feature', description: 'normal merge' },
  { command: 'git cherry-pick abc123', description: 'normal cherry-pick' },
  { command: 'git rebase main', description: 'normal rebase' },
  { command: 'git am < patch', description: 'normal am' },
  // Git commands that don't support --no-verify
  { command: 'git status', description: 'git status' },
  { command: 'git log --oneline', description: 'git log' }, // cspell:disable-line
  { command: 'git diff', description: 'git diff' },
  { command: 'git branch -a', description: 'git branch' },
  { command: 'git checkout main', description: 'git checkout' },
  { command: 'git pull origin main', description: 'git pull' },
  { command: 'git fetch --all', description: 'git fetch' },
  { command: 'git stash', description: 'git stash' },
  // Non-git commands
  { command: 'npm install', description: 'npm install' },
  { command: 'pnpm build', description: 'pnpm build' },
  { command: 'yarn test', description: 'yarn test' },
  { command: 'ls -la', description: 'ls command' },
  { command: 'echo "hello"', description: 'echo command' },
  // -n flag in non-commit contexts (different meaning)
  { command: 'git push -n origin main', description: 'push -n (dry-run)' },
  { command: 'git merge -n feature', description: 'merge -n (no commit)' },
  {
    command: 'git cherry-pick -n abc123',
    description: 'cherry-pick -n (no commit)',
  },
  // Commands with special characters
  {
    command: 'git commit -m "feat(scope): add feature #123"',
    description: 'special chars',
  },
  {
    command: 'git commit -m "fix: handle edge case @user"',
    description: '@ mention',
  },
]
