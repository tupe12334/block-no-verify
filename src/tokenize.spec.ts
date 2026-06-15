import { describe, it, expect } from 'vitest'
import { tokenize } from './tokenize.js'

describe('tokenize', () => {
  it('splits on unquoted whitespace', () => {
    expect(tokenize('git commit -n')).toEqual([
      { type: 'word', value: 'git' },
      { type: 'word', value: 'commit' },
      { type: 'word', value: '-n' },
    ])
  })

  it('keeps a double-quoted span as one word with quotes removed', () => {
    expect(tokenize('git commit -m "hello world"')).toEqual([
      { type: 'word', value: 'git' },
      { type: 'word', value: 'commit' },
      { type: 'word', value: '-m' },
      { type: 'word', value: 'hello world' },
    ])
  })

  it('keeps flag-like text inside a quoted message as a single word', () => {
    expect(tokenize('git commit -m "kubectl logs -n kube-system"')).toEqual([
      { type: 'word', value: 'git' },
      { type: 'word', value: 'commit' },
      { type: 'word', value: '-m' },
      { type: 'word', value: 'kubectl logs -n kube-system' },
    ])
  })

  it('treats single quotes inside double quotes as literal', () => {
    const tokens = tokenize('git commit -m "find . -name \'*.sh\'"')
    expect(tokens[3]).toEqual({ type: 'word', value: "find . -name '*.sh'" })
  })

  it('emits shell operators as op tokens', () => {
    expect(tokenize('git commit -m "msg" && find . -name x')).toEqual([
      { type: 'word', value: 'git' },
      { type: 'word', value: 'commit' },
      { type: 'word', value: '-m' },
      { type: 'word', value: 'msg' },
      { type: 'op', value: '&&' },
      { type: 'word', value: 'find' },
      { type: 'word', value: '.' },
      { type: 'word', value: '-name' },
      { type: 'word', value: 'x' },
    ])
  })

  it('spans newlines inside a quoted message', () => {
    const tokens = tokenize('git commit -m "line one\nhas --no-verify text"')
    expect(tokens[3]).toEqual({
      type: 'word',
      value: 'line one\nhas --no-verify text',
    })
  })

  it('removes surrounding quotes from a quoted flag', () => {
    expect(tokenize('git commit "--no-verify"')).toEqual([
      { type: 'word', value: 'git' },
      { type: 'word', value: 'commit' },
      { type: 'word', value: '--no-verify' },
    ])
  })
})
