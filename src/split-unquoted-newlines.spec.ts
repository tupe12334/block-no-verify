import { describe, it, expect } from 'vitest'
import { splitUnquotedNewlines } from './split-unquoted-newlines.js'

describe('splitUnquotedNewlines', () => {
  it('turns an unquoted newline into a statement separator', () => {
    expect(splitUnquotedNewlines('git commit -m x\nbash -n s.sh')).toBe(
      'git commit -m x;bash -n s.sh'
    )
  })

  it('keeps a newline inside double quotes', () => {
    expect(splitUnquotedNewlines('echo "a\nb"\nls')).toBe('echo "a\nb";ls')
  })

  it('keeps a newline inside single quotes', () => {
    expect(splitUnquotedNewlines("echo 'a\nb'\nls")).toBe("echo 'a\nb';ls")
  })

  it('does not open a quote for an escaped quote', () => {
    expect(splitUnquotedNewlines('echo \\"\nls')).toBe('echo \\";ls')
  })
})
