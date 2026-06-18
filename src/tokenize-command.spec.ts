import { describe, it, expect } from 'vitest'
import { tokenizeCommand } from './tokenize-command.js'

describe('tokenizeCommand', () => {
  it('splits a plain command on whitespace', () => {
    expect(tokenizeCommand('git commit -m test')).toEqual([
      'git',
      'commit',
      '-m',
      'test',
    ])
  })

  it('keeps a double-quoted value as a single token and strips the quotes', () => {
    expect(tokenizeCommand('git commit -m "a normal message"')).toEqual([
      'git',
      'commit',
      '-m',
      'a normal message',
    ])
  })

  it('treats single quotes inside double quotes as literal', () => {
    expect(
      tokenizeCommand('git commit -m "find scripts -name \'*.sh\'"')
    ).toEqual(['git', 'commit', '-m', "find scripts -name '*.sh'"])
  })

  it('keeps a multi-line double-quoted value as one token', () => {
    expect(tokenizeCommand('git commit -m "line one\n\nline two"')).toEqual([
      'git',
      'commit',
      '-m',
      'line one\n\nline two',
    ])
  })

  it('unescapes backslash-escaped quotes inside double quotes', () => {
    expect(tokenizeCommand('git commit -m "say \\"hi\\""')).toEqual([
      'git',
      'commit',
      '-m',
      'say "hi"',
    ])
  })

  it('handles a backslash-escaped space outside quotes', () => {
    expect(tokenizeCommand('a\\ b c')).toEqual(['a b', 'c'])
  })

  it('returns an empty list for whitespace-only input', () => {
    expect(tokenizeCommand('   \n\t ')).toEqual([])
  })
})
