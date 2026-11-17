import { describe, it, expect } from 'vitest'
import { expandParameterWords } from './expand-parameter-words.js'

const param = (op: string, word: string): string => '$' + `{x${op}${word}}`

describe('expandParameterWords', () => {
  it.each([':-', '-', ':=', '=', ':+', '+'])(
    'replaces a %s expansion with its word',
    op => {
      expect(expandParameterWords(`${param(op, 'git')} status`)).toBe(
        'git status'
      )
    }
  )

  it('resolves nested expansions from the inside out', () => {
    expect(expandParameterWords(param(':-', param(':-', 'git')))).toBe('git')
  })

  it.each([
    `'${param(':-', 'git')}'`,
    `\\${param(':-', 'git')}`,
    param(':-', ''),
    param(':-', 'a b'),
    param(':-', '$(echo git)'),
    param(':?', 'git'),
  ])('keeps %s as written', text => {
    expect(expandParameterWords(text)).toBe(text)
  })
})
