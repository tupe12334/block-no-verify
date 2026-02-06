import type { TestCommand } from './test-command.js'

/** Commands that should be blocked (contain --no-verify or hooks bypass) */
export const BLOCKED_COMMANDS: TestCommand[] = [
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
    description: 'chained with --no-verify',
  },
  {
    command: 'git -C /path commit --no-verify -m "test"',
    description: '-C flag with --no-verify',
  },
  {
    command: 'git    commit    --no-verify -m "test"',
    description: 'extra whitespace',
  },
  // core.hooksPath override (bypass hooks by redirecting hooks directory)
  {
    command: 'git -c core.hooksPath=/dev/null push',
    description: 'hooksPath=/dev/null push',
  },
  {
    command: 'git -c core.hooksPath=/dev/null commit -m "test"',
    description: 'hooksPath commit',
  },
  {
    command: 'git -c core.hooksPath= push origin main',
    description: 'empty hooksPath push',
  },
  {
    command: 'git -c "core.hooksPath=/dev/null" push',
    description: 'quoted hooksPath push',
  },
]
