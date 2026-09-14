import { describe, expect, it } from 'vitest'
import { stripHeredocBodies } from './strip-heredoc-bodies.js'

describe('stripHeredocBodies', () => {
  it('removes an unquoted heredoc body, keeping the delimiter lines', () => {
    const result = stripHeredocBodies('cat <<EOF\ngrep -n foo\nEOF\necho done')
    expect(result).toBe('cat <<EOF\nEOF\necho done')
  })

  it('removes a quoted heredoc body', () => {
    const result = stripHeredocBodies("cat <<'EOF'\n--no-verify\nEOF")
    expect(result).toBe("cat <<'EOF'\nEOF")
  })

  it('strips leading tabs from the terminator when using <<-', () => {
    const result = stripHeredocBodies('cat <<-EOF\nbody\n\tEOF')
    expect(result).toBe('cat <<-EOF\n\tEOF')
  })

  it('leaves input without a heredoc unchanged', () => {
    const result = stripHeredocBodies('git commit -m "test"')
    expect(result).toBe('git commit -m "test"')
  })

  it('does not treat an unterminated heredoc body as ending early', () => {
    const result = stripHeredocBodies('cat <<EOF\nline one\nline two')
    expect(result).toBe('cat <<EOF')
  })
})
