import { describe, it, expect } from 'vitest'
import { stdinIsCode } from './stdin-is-code.js'

describe('stdinIsCode', () => {
  it.each([
    [[]],
    [['-']],
    [['-u']],
    [['-I', '-']],
    [['run', '-']],
    [['-W', 'ignore']],
    [['-r', 'x', '-']],
  ])('reads code from stdin for %j', args => {
    expect(stdinIsCode(args)).toBe(true)
  })

  it.each([
    [['script.py']],
    [['-m', 'json.tool']],
    [['-c', 'print(1)']],
    [['-pe', 's/a/b/']],
    [['--eval', 'x']],
    [['dist/cli.js']],
  ])('reads data from stdin for %j', args => {
    expect(stdinIsCode(args)).toBe(false)
  })
})
