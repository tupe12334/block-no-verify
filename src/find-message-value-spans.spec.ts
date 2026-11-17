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
    expect(values('gh pr create --body="git x" -B main')).toEqual(['git x'])
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
    expect(values("git commit -m 'a $x'")).toEqual(['a $x'])
  })

  it('skips a value that is not one quoted part', () => {
    expect(values('git commit -m fix')).toEqual([])
    expect(values('git commit -m "a"\'b\'')).toEqual([])
    expect(values('git commit -m x"git y"')).toEqual([])
  })

  it('finds nothing when masking is not safe', () => {
    expect(values('git commit -m "a" # x')).toEqual([])
    expect(values('git commit -m "a"\ngit push')).toEqual([])
    expect(values('git -c alias.x=y commit -m "a"')).toEqual([])
    expect(values('git commit -m "a')).toEqual([])
  })

  it('ends the statement at a glob', () => {
    expect(values('git add *.ts -m "a"')).toEqual([])
    expect(values('echo *.ts git commit -m "a"')).toEqual(['a'])
  })
})
