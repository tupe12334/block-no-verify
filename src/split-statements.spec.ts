import { describe, it, expect } from 'vitest'
import { splitStatements } from './split-statements.js'

describe('splitStatements', () => {
  it('returns the whole input as one statement when there is no separator', () => {
    expect(splitStatements('git commit -m "test"')).toEqual([
      'git commit -m "test"',
    ])
  })

  it('splits on a semicolon', () => {
    expect(splitStatements('git commit -m "test"; echo done')).toEqual([
      'git commit -m "test"',
      ' echo done',
    ])
  })

  it('splits on && by treating each & as a boundary, yielding an empty statement between them', () => {
    expect(
      splitStatements('git commit -m "test" && git push --no-verify')
    ).toEqual(['git commit -m "test" ', '', ' git push --no-verify'])
  })

  it('splits on a pipe', () => {
    expect(splitStatements('git log | grep -n foo')).toEqual([
      'git log ',
      ' grep -n foo',
    ])
  })

  it('splits on a newline', () => {
    expect(splitStatements('git status\ngit push')).toEqual([
      'git status',
      'git push',
    ])
  })

  it('returns a single empty statement for an empty string', () => {
    expect(splitStatements('')).toEqual([''])
  })
})
