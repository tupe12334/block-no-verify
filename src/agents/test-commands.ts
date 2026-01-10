/**
 * Test commands for agent format testing
 */

interface TestCommand {
  command: string
  description: string
}

/**
 * Commands that should be blocked (contain --no-verify)
 */
const BLOCKED_COMMANDS: TestCommand[] = [
  // --no-verify flag
  {
    command: 'git commit --no-verify -m "test"',
    description: 'commit with --no-verify',
  },
  {
    command: 'git commit -m "test" --no-verify',
    description: 'commit with --no-verify at end',
  },
  {
    command: 'git push --no-verify origin main',
    description: 'push with --no-verify',
  },
  {
    command: 'git push origin main --no-verify',
    description: 'push with --no-verify at end',
  },
  {
    command: 'git merge --no-verify feature',
    description: 'merge with --no-verify',
  },
  {
    command: 'git cherry-pick --no-verify abc123',
    description: 'cherry-pick with --no-verify',
  },
  {
    command: 'git rebase --no-verify main',
    description: 'rebase with --no-verify',
  },
  { command: 'git am --no-verify < patch', description: 'am with --no-verify' },

  // -n shorthand (only for commit)
  { command: 'git commit -n -m "test"', description: 'commit with -n flag' },
  { command: 'git commit -m "test" -n', description: 'commit with -n at end' },
  {
    command: 'git commit -nm "test"',
    description: 'commit with combined -nm flags',
  },

  // Edge cases
  {
    command: 'ls && git commit --no-verify -m "test"',
    description: 'chained command with --no-verify',
  },
  {
    command: 'git -C /path commit --no-verify -m "test"',
    description: 'git with -C flag and --no-verify',
  },
  {
    command: 'git    commit    --no-verify -m "test"',
    description: 'extra whitespace with --no-verify',
  },
]

/**
 * Commands that should be allowed (no --no-verify)
 */
const ALLOWED_COMMANDS: TestCommand[] = [
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
  { command: 'git log --oneline', description: 'git log with oneline' }, // cspell:disable-line
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
  { command: 'git push -n origin main', description: 'push dry-run with -n' },
  { command: 'git merge -n feature', description: 'merge with -n (no commit)' },
  {
    command: 'git cherry-pick -n abc123',
    description: 'cherry-pick with -n (no commit)',
  },

  // Commands with special characters
  {
    command: 'git commit -m "feat(scope): add feature #123"',
    description: 'commit with special chars',
  },
  {
    command: 'git commit -m "fix: handle edge case @user"',
    description: 'commit with @ mention',
  },
]

export const testCommands = {
  BLOCKED_COMMANDS,
  ALLOWED_COMMANDS,
}
