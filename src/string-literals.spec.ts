import { describe, it, expect } from 'vitest'
import { stringLiterals } from './string-literals.js'

describe('stringLiterals', () => {
  it.each([
    [`os.system('git status')`, ['git status']],
    [`print("a \\" b")`, ['a " b']],
    ['system qq{git push}', ['git push']],
    ['system q(git (x) push)', ['git (x) push']],
    ['qx[git log]; qw/a b/', ['git log', 'a b']],
    ['q|git fetch|', ['git fetch']],
    ['system %q(git push)', ['git push']],
    ['%x{git log}', ['git log']],
    ['%Q[git status]', ['git status']],
    ['%(git fetch)', ['git fetch']],
  ])('reads %s', (code, literals) => {
    expect(stringLiterals(code, true)).toEqual(literals)
  })

  it.each([
    'seq(1)',
    'x % 2',
    'print(1)',
    'eq(a, b)',
    'my $q = 1; $q++',
    'a %= 2',
  ])('finds nothing in %s', code => {
    expect(stringLiterals(code, true)).toEqual([])
  })
})
