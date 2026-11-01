import { describe, it, expect } from 'vitest'
import { commandWords } from './command-words.js'

describe('commandWords', () => {
  it.each([
    ['bash', ['bash']],
    ['<<EOF bash', ['bash']],
    ['< in.txt sh -s', ['sh', '-s']],
    ['2>/dev/null sh', ['sh']],
    ['> out sh', ['sh']],
    ['  cat  ', ['cat']],
  ])('%s', (segment, words) => {
    expect(commandWords(segment)).toEqual(words)
  })
})
