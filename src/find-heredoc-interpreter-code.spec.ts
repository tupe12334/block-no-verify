import { describe, it, expect } from 'vitest'
import { findHeredocInterpreterCode } from './find-heredoc-interpreter-code.js'

describe('findHeredocInterpreterCode', () => {
  it('returns the string literals of a heredoc fed to python', () => {
    const input = 'python3 <<EOF\nos.system("git commit -n")\nEOF'
    expect(findHeredocInterpreterCode(input)).toContain('git commit -n')
  })

  it('returns nothing for a heredoc fed to cat', () => {
    expect(findHeredocInterpreterCode('cat <<EOF\nx("git")\nEOF')).toEqual([])
  })
})
