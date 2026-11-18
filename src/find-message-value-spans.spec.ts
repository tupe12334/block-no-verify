import { describe, it, expect } from 'vitest'
import { findMessageValueSpans } from './find-message-value-spans.js'

/**
 * Returns the text of each span that {@link findMessageValueSpans} finds.
 * @param input - The command text.
 * @returns The text inside each found value.
 */
function values(input: string): string[] {
  return findMessageValueSpans(input).map(span =>
    input.slice(span.start, span.end)
  )
}

describe('findMessageValueSpans', () => {
  it('finds quoted message values of git and gh', () => {
    expect(values('git commit -m "fix git log"')).toEqual(['fix git log'])
    expect(values("gh pr create --title 'a' --body 'b c'")).toEqual([
      'a',
      'b c',
    ])
    expect(values('A=1 git tag -a v1 -m "x"')).toEqual(['x'])
  })

  it('finds a value in each git or gh statement', () => {
    expect(values('git commit -m "a" && gh pr create --body "b"')).toEqual([
      'a',
      'b',
    ])
  })

  it('skips values of other programs', () => {
    expect(values('echo -m "git log"')).toEqual([])
    expect(values('bash -c "git commit -m x"')).toEqual([])
    expect(values('git commit -m x; echo -m "git y"')).toEqual([])
  })

  it('skips a value that can run code', () => {
    expect(values('git commit -m "$(git log)"')).toEqual([])
    expect(values('git commit -m "`git log`"')).toEqual([])
    expect(values('git commit -m "a $x"')).toEqual([])
    expect(values("git commit -m 'a $x'")).toEqual([])
  })

  it('skips a value that is not one quoted part', () => {
    expect(values('git commit -m fix')).toEqual([])
    expect(values('git commit -m "a"\'b\'')).toEqual([])
    expect(values('git commit -m x"git y"')).toEqual([])
    expect(values("git commit -m 'a'b")).toEqual([])
    expect(values("git commit -m 'a'$x")).toEqual([])
    expect(values("git commit -m 'a'\\ b")).toEqual([])
    expect(values("git commit -m 'a'' b'")).toEqual([])
    expect(values('git commit -m "a"\\"')).toEqual([])
    expect(values('gh pr create --body="git x" -B main')).toEqual([])
  })

  it('finds nothing when masking is not safe', () => {
    expect(values('git commit -m "a" # x')).toEqual([])
    expect(values('git commit -m "a"\ngit push')).toEqual([])
    expect(values('git -c alias.x=y commit -m "a"')).toEqual([])
    expect(values('git commit -m "a')).toEqual([])
  })

  it('masks only options that take a message in that sub-command', () => {
    expect(values('git rebase -m "-n" main')).toEqual([])
    expect(values('git cherry-pick -m "1" abc')).toEqual([])
    expect(values('git revert -m "1" HEAD')).toEqual([])
    expect(values('git -C . commit -m "a"')).toEqual([])
    expect(values('git stash -m "a"')).toEqual([])
    expect(values('git merge --message "a"')).toEqual([])
    expect(values('gh pr comment --title "a"')).toEqual([])
    expect(values('gh x --message "a"')).toEqual([])
    expect(values('git merge -m "a"')).toEqual(['a'])
    expect(values('git notes add -m "a"')).toEqual(['a'])
    expect(values('git stash push --message "a"')).toEqual(['a'])
    expect(values('gh pr comment -b "a"')).toEqual(['a'])
    expect(values('gh issue create -t "a" -b "b"')).toEqual(['a', 'b'])
    expect(values('gh release create v1 --notes "a"')).toEqual(['a'])
  })

  it('reads a glob as a word, not a statement end', () => {
    expect(values('git commit *.ts -m "a"')).toEqual(['a'])
    expect(values('echo *.ts git commit -m "a"')).toEqual([])
  })

  it('needs the program word to be literally git or gh', () => {
    expect(values('{ git commit -m "a"; }')).toEqual(['a'])
    expect(values('(git commit -m "a")')).toEqual(['a'])
    expect(values('"git" commit -m "a"')).toEqual([])
    expect(values('/usr/bin/git commit -m "a"')).toEqual([])
    expect(values('git commit > f -m "a"')).toEqual(['a'])
    expect(values('echo > git -m "a"')).toEqual([])
    expect(values('> f git commit -m "a"')).toEqual([])
  })

  it('finds nothing when a command can run inside another', () => {
    expect(values("git status `parallel -m 'a' ::: x`")).toEqual([])
    expect(values("git commit -m 'a' $(true)")).toEqual([])
    expect(values("git commit -m 'a' <(true)")).toEqual([])
    expect(values("git commit -m 'a' >(true)")).toEqual([])
    expect(values("git commit -m 'a'; eval x")).toEqual([])
  })
})
