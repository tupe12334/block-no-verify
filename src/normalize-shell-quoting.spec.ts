import { describe, it, expect } from 'vitest'
import { normalizeShellQuoting } from './normalize-shell-quoting.js'

describe('normalizeShellQuoting', () => {
  it('drops the $ from an ANSI-C quoted word, leaving a plain single-quoted word', () => {
    expect(normalizeShellQuoting("$'--no-verify'")).toBe("'--no-verify'")
  })

  it('drops the $ from a locale-quoted word, leaving a plain double-quoted word', () => {
    expect(normalizeShellQuoting('$"--no-verify"')).toBe('"--no-verify"')
  })

  it('removes a backslash-newline line continuation inside a double-quoted word', () => {
    expect(normalizeShellQuoting('"--no-ver\\\nify"')).toBe('"--no-verify"')
  })

  it('removes a backslash-newline line continuation outside quotes', () => {
    expect(normalizeShellQuoting('-m \\\n"x"')).toBe('-m "x"')
  })

  it('leaves a backslash-newline inside a single-quoted word untouched', () => {
    expect(normalizeShellQuoting("'--no-ver\\\nify'")).toBe("'--no-ver\\\nify'")
  })

  it('leaves a $ followed by a quote character alone when already inside a double-quoted word', () => {
    expect(normalizeShellQuoting('"costs $\'5"')).toBe('"costs $\'5"')
  })

  it('preserves an escaped double quote inside a double-quoted word', () => {
    expect(normalizeShellQuoting('"say \\"hi\\""')).toBe('"say \\"hi\\""')
  })

  it('leaves input with no special constructs unchanged', () => {
    expect(normalizeShellQuoting('git commit -m "test" --no-verify')).toBe(
      'git commit -m "test" --no-verify'
    )
  })
})
