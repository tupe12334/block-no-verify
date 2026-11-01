import { describe, it, expect } from 'vitest'
import { findPrintedSubstitutions } from './find-printed-substitutions.js'

describe('findPrintedSubstitutions', () => {
  it('returns the literal text an echo substitution prints', () => {
    expect(
      findPrintedSubstitutions('eval "$(echo \'git commit -n\')"')
    ).toEqual(['git commit -n'])
  })

  it('returns nothing for a substitution that runs another command', () => {
    expect(findPrintedSubstitutions('echo "$(date)"')).toEqual([])
  })
})
