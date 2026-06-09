import { describe, it, expect } from 'vitest'
import { tokenize } from './tokenize.js'

describe('tokenize', () => {
  it('splits on unquoted whitespace', () => {
    expect(tokenize('git commit -m test')).toEqual([
      'git',
      'commit',
      '-m',
      'test',
    ])
  })

  it('keeps a double-quoted value as a single token without the quotes', () => {
    expect(tokenize('git commit -m "a real message"')).toEqual([
      'git',
      'commit',
      '-m',
      'a real message',
    ])
  })

  it('keeps a single-quoted value as a single token', () => {
    expect(tokenize("git commit -m 'a real message'")).toEqual([
      'git',
      'commit',
      '-m',
      'a real message',
    ])
  })

  it('joins adjacent quoted and unquoted parts into one token', () => {
    expect(tokenize('git commit -m"x"')).toEqual(['git', 'commit', '-mx'])
  })

  it('treats shell metacharacters as separators', () => {
    expect(tokenize('git commit --no-verify;ls')).toEqual([
      'git',
      'commit',
      '--no-verify',
      'ls',
    ])
  })

  it('strips an unquoted here-document body', () => {
    const input = [
      'git commit -F - <<EOF',
      'a --no-verify mention',
      'EOF',
    ].join('\n')
    expect(tokenize(input)).toEqual(['git', 'commit', '-F', '-'])
  })

  it('keeps a heredoc inside a command substitution within its quoted token', () => {
    const input = [`git commit -m "$(cat <<'EOF'`, 'msg', 'EOF', ')"'].join(
      '\n'
    )
    const tokens = tokenize(input)
    expect(tokens.slice(0, 3)).toEqual(['git', 'commit', '-m'])
    expect(tokens).toHaveLength(4)
    expect(tokens[3]).not.toContain('--no-verify')
  })
})
