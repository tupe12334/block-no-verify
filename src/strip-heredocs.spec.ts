import { describe, it, expect } from 'vitest'
import { stripHeredocs } from './strip-heredocs.js'

describe('stripHeredocs', () => {
  it('drops the body and terminator of an unquoted heredoc', () => {
    const input = [
      'git commit -F - <<EOF',
      'a --no-verify mention',
      'EOF',
    ].join('\n')
    const result = stripHeredocs(input)
    expect(result).not.toContain('--no-verify')
    expect(result).toContain('git commit -F -')
  })

  it('drops a quoted-delimiter heredoc body', () => {
    const input = ["git commit -F - <<'EOF'", '--no-verify here', 'EOF'].join(
      '\n'
    )
    expect(stripHeredocs(input)).not.toContain('--no-verify')
  })

  it('leaves a command without a heredoc unchanged', () => {
    const input = 'git commit -m "a normal message"'
    expect(stripHeredocs(input)).toBe(input)
  })

  it('does not treat a here-string (<<<) as a here-document', () => {
    const input = 'cat <<< "data"'
    expect(stripHeredocs(input)).toBe(input)
  })
})
