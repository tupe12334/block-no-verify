import { describe, it, expect } from 'vitest'
import { tokenizeCommand } from './tokenize-command.js'

describe('tokenizeCommand', () => {
  it('expands a simple variable reference before tokenizing', () => {
    expect(tokenizeCommand('c=push; git $c --no-verify')).toEqual([
      'c=push',
      { op: ';' },
      'git',
      'push',
      '--no-verify',
    ])
  })

  it('normalizes an ANSI-C quoted word before tokenizing', () => {
    expect(tokenizeCommand("git commit $'--no-verify'")).toEqual([
      'git',
      'commit',
      '--no-verify',
    ])
  })

  it('tokenizes a plain command with no special constructs', () => {
    expect(tokenizeCommand('git commit -m "test"')).toEqual([
      'git',
      'commit',
      '-m',
      'test',
    ])
  })
})
