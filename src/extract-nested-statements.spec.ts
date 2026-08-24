import { describe, it, expect } from 'vitest'
import { extractNestedStatements } from './extract-nested-statements.js'
import { tokenizeCommand } from './tokenize-command.js'

describe('extractNestedStatements', () => {
  it('returns an empty array when no token holds a substitution', () => {
    expect(
      extractNestedStatements(tokenizeCommand('git commit -m "test"'))
    ).toEqual([])
  })

  it('recovers a statement from a $(...) substitution nested in double quotes', () => {
    expect(
      extractNestedStatements(
        tokenizeCommand('echo "$(git commit --no-verify)"')
      )
    ).toEqual([['git', 'commit', '--no-verify']])
  })

  it('recovers a statement from a backtick substitution nested in double quotes', () => {
    expect(
      extractNestedStatements(
        tokenizeCommand('echo "`git commit --no-verify`"')
      )
    ).toEqual([['git', 'commit', '--no-verify']])
  })

  it('recurses into a substitution nested inside another substitution', () => {
    // Fabricated directly as tokens (rather than through tokenizeCommand) to
    // model the token shell-quote would produce for a doubly-nested
    // substitution without needing a fully escaped, valid bash literal.
    const tokens = ['echo', '$(echo "$(git commit --no-verify)")']
    expect(extractNestedStatements(tokens)).toContainEqual([
      'git',
      'commit',
      '--no-verify',
    ])
  })
})
