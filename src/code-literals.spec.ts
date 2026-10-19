import { describe, it, expect } from 'vitest'
import { codeLiterals } from './code-literals.js'

describe('codeLiterals', () => {
  it('joins an argv list', () => {
    expect(codeLiterals(`run(['git', 'log'])`, 'python3')).toEqual([
      'git',
      'log',
      'git log',
    ])
  })

  it('reads quote operators only for perl and ruby', () => {
    expect(codeLiterals('system qq{git log}', 'perl')).toEqual(['git log'])
    expect(codeLiterals('x = q(1)', 'python3')).toEqual([])
  })
})
