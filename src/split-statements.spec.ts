import { describe, it, expect } from 'vitest'
import { splitStatements } from './split-statements.js'
import { tokenizeCommand } from './tokenize-command.js'

describe('splitStatements', () => {
  it('returns one statement for input with no control operators', () => {
    expect(splitStatements(tokenizeCommand('git commit -m "test"'))).toEqual([
      ['git', 'commit', '-m', 'test'],
    ])
  })

  it('splits on ; && || | & into separate statements', () => {
    expect(
      splitStatements(tokenizeCommand('git status && echo done; echo two'))
    ).toEqual([
      ['git', 'status'],
      ['echo', 'done'],
      ['echo', 'two'],
    ])
  })

  it('does not split on a control character inside a quoted string', () => {
    expect(
      splitStatements(tokenizeCommand('git commit -m "fix; cleanup"'))
    ).toEqual([['git', 'commit', '-m', 'fix; cleanup']])
  })

  it('drops operator tokens from the resulting statements', () => {
    const statements = splitStatements(tokenizeCommand('git status || git log'))
    expect(statements.flat()).not.toContain('||')
  })
})
