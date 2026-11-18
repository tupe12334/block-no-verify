/**
 * Options that take a message value, by the command words before them. The
 * key is the program and its sub-command words (`git commit`,
 * `gh pr create`). Only these options are masked: the same short option can
 * mean something else elsewhere (`git rebase -m` is `--merge`, with no
 * value, so the next word is a real flag).
 */
const MESSAGE_VALUE_OPTIONS = new Map<string, readonly string[]>([
  ['git commit', ['-m', '--message']],
  ['git tag', ['-m', '--message']],
  ['git merge', ['-m']],
  ['git notes add', ['-m']],
  ['git notes append', ['-m']],
  ['git stash push', ['-m', '--message']],
  ['git stash save', ['-m', '--message']],
  ['gh pr create', ['-t', '--title', '-b', '--body']],
  ['gh pr edit', ['-t', '--title', '-b', '--body']],
  ['gh pr comment', ['-b', '--body']],
  ['gh pr review', ['-b', '--body']],
  ['gh issue create', ['-t', '--title', '-b', '--body']],
  ['gh issue edit', ['-t', '--title', '-b', '--body']],
  ['gh issue comment', ['-b', '--body']],
  ['gh release create', ['--notes', '--title']],
  ['gh release edit', ['--notes', '--title']],
])

/**
 * Returns true when `option` takes a message value in the command that
 * `words` starts. The program must be the first word and its sub-command
 * words must follow it directly (`git commit`, `gh pr create`), so a global
 * option before the sub-command (`git -C dir commit`) does not match.
 * @param words - The raw words of the simple command so far, program first.
 * @param option - The option word just before the value.
 * @returns True when the value after `option` is a message.
 */
export function takesMessageValue(
  words: readonly string[],
  option: string
): boolean {
  for (const length of [2, 3]) {
    const options = MESSAGE_VALUE_OPTIONS.get(words.slice(0, length).join(' '))
    if (options?.includes(option) === true) return true
  }
  return false
}
