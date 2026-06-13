import { describe, it, expect } from 'vitest'
import { skipHeredoc } from './skip-heredoc.js'

describe('skipHeredoc', () => {
  it('skips past the terminator line of a simple heredoc', () => {
    const input = ['<<EOF', 'body line', 'EOF', 'after'].join('\n')
    const next = skipHeredoc(input, 0)
    expect(input.slice(next)).toBe('after')
  })

  it('skips a quoted-delimiter heredoc', () => {
    const input = ["<<'EOF'", 'a --no-verify mention', 'EOF', 'after'].join(
      '\n'
    )
    const next = skipHeredoc(input, 0)
    expect(input.slice(next)).toBe('after')
  })

  it('honors the <<- dash form with an indented terminator', () => {
    const input = ['<<-EOF', '\tbody', '\tEOF', 'after'].join('\n')
    const next = skipHeredoc(input, 0)
    expect(input.slice(next)).toBe('after')
  })

  it('returns the start index when no delimiter word is present', () => {
    const input = '<< '
    expect(skipHeredoc(input, 0)).toBe(0)
  })
})
