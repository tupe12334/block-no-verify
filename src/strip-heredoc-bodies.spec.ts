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

  it('removes the body of a heredoc whose delimiter is backslash-quoted', () => {
    const result = stripHeredocBodies('cat <<\\EOF\ngit push --no-verify\nEOF')
    expect(result).toBe('cat <<\\EOF\nEOF')
  })

  it('keeps the body of a heredoc fed to a shell, which runs it', () => {
    const body = 'bash <<EOF\ngit commit --no-verify -m x\nEOF'
    expect(stripHeredocBodies(body)).toBe(body)
    const sh = 'sh -s <<EOF\ngit push --no-verify\nEOF'
    expect(stripHeredocBodies(sh)).toBe(sh)
  })

  it('removes the body of a shell heredoc given -c, which reads its operand', () => {
    const result = stripHeredocBodies("bash -c 'cat' <<EOF\ngit commit\nEOF")
    expect(result).toBe("bash -c 'cat' <<EOF\nEOF")
  })

  it('keeps the body when the shell is the last command before the heredoc', () => {
    const body = 'cat x | bash <<EOF\ngit push --no-verify\nEOF'
    expect(stripHeredocBodies(body)).toBe(body)
  })

  it('does not treat a here-string as a heredoc', () => {
    const input = 'cat <<< "x"\ngit commit --no-verify'
    expect(stripHeredocBodies(input)).toBe(input)
  })

  it('queues two heredoc bodies opened on one line', () => {
    const result = stripHeredocBodies(
      "cat <<A <<'B'\nx\nA\ny\nB\ngit push --no-verify"
    )
    // Only the unquoted body loses its plain lines. The quoted body is kept,
    // because a line that is not a plain `cat` may hand it to a shell.
    expect(result).toBe("cat <<A <<'B'\nA\ny\nB\ngit push --no-verify")
  })

  it('keeps a quoted heredoc body whose consumer is not a plain cat', () => {
    const input = 'cat <<\\EOF | bash\ngit push --no-verify\nEOF'
    expect(stripHeredocBodies(input)).toBe(input)
  })

  it('escapes the expansions of a kept quoted body the shell never expands', () => {
    const result = stripHeredocBodies(
      "cat > run.mjs <<'EOF'\nconsole.log(`${r.stdout.trim()}`)\nEOF"
    )
    expect(result).toBe(
      "cat > run.mjs <<'EOF'\nconsole.log(\\`\\${r.stdout.trim()}\\`)\nEOF"
    )
  })

  it('keeps the bypass text of a kept quoted body readable after escaping', () => {
    const result = stripHeredocBodies(
      "tee s.sh <<'EOF'\ngit -c core.hooksPath=$HOME/x push --no-verify\nEOF"
    )
    expect(result).toContain('--no-verify')
    expect(result).toContain('core.hooksPath=')
  })

  it('does not escape a quoted body that a shell on the line runs', () => {
    const input = 'bash <<\'EOF\'\ngit push --no-verify "${FLAG}"\nEOF'
    expect(stripHeredocBodies(input)).toBe(input)
  })
})
