import { describe, it, expect } from 'vitest'
import { expandSimpleVariableRefs } from './expand-simple-variable-refs.js'

describe('expandSimpleVariableRefs', () => {
  it('expands a bare $NAME reference to its assigned value', () => {
    expect(expandSimpleVariableRefs('c=push; git $c --no-verify')).toBe(
      'c=push; git push --no-verify'
    )
  })

  it('expands git itself when hidden behind a variable', () => {
    expect(expandSimpleVariableRefs('g=git; $g push --no-verify')).toBe(
      'g=git; git push --no-verify'
    )
  })

  it('expands a braced ${NAME} reference to its assigned value', () => {
    expect(expandSimpleVariableRefs('c=push; git ${c} --no-verify')).toBe(
      'c=push; git push --no-verify'
    )
  })

  it('expands a double-quoted assignment value', () => {
    expect(expandSimpleVariableRefs('c="push"; git $c --no-verify')).toBe(
      'c="push"; git push --no-verify'
    )
  })

  it('expands a single-quoted assignment value', () => {
    expect(expandSimpleVariableRefs("c='push'; git $c --no-verify")).toBe(
      "c='push'; git push --no-verify"
    )
  })

  it('does not replace a longer variable name sharing the same prefix', () => {
    expect(expandSimpleVariableRefs('c=push; echo $cfoo')).toBe(
      'c=push; echo $cfoo'
    )
  })

  it('leaves input untouched when there is no assignment', () => {
    expect(expandSimpleVariableRefs('git commit -m "test"')).toBe(
      'git commit -m "test"'
    )
  })

  it('leaves input untouched when the assignment is never referenced', () => {
    expect(
      expandSimpleVariableRefs('GIT_AUTHOR_NAME="Name" git commit -m "test"')
    ).toBe('GIT_AUTHOR_NAME="Name" git commit -m "test"')
  })

  it('leaves an empty string untouched', () => {
    expect(expandSimpleVariableRefs('')).toBe('')
  })
})
