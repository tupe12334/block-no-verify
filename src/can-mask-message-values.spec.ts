import { describe, it, expect } from 'vitest'
import { canMaskMessageValues } from './can-mask-message-values.js'

describe('canMaskMessageValues', () => {
  it.each([
    'git commit -m "one line"',
    'git commit -m "line one\n\nline two"',
    "git commit -m 'line one\nline two'",
    'git commit -m x \\\n  --amend',
  ])('allows masking for %j', input => {
    expect(canMaskMessageValues(input)).toBe(true)
  })

  it.each([
    'git commit -m x\nparallel -m "y" ::: a',
    'git commit -m "x"\n\nFOO=1 parallel -m "y"',
    'cat <<EOF\ntext\nEOF',
    'git commit -m x # note',
    'git -c alias.x=\'!sh -c\' x -m "y"',
    'gh alias set x \'!sh -c\' && gh x --body "y"',
  ])('skips masking for %j', input => {
    expect(canMaskMessageValues(input)).toBe(false)
  })
})
