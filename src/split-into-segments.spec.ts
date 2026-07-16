import { describe, it, expect } from 'vitest'
import { parse } from 'shell-quote'
import { splitIntoSegments } from './split-into-segments.js'

const segmentsOf = (input: string): string[][] =>
  splitIntoSegments(parse(input)).map(segment =>
    segment.filter((token): token is string => typeof token === 'string')
  )

describe('splitIntoSegments', () => {
  it('splits a single command into one segment', () => {
    expect(segmentsOf('git commit -m x')).toEqual([
      ['git', 'commit', '-m', 'x'],
    ])
  })

  it('splits at && into two segments', () => {
    expect(segmentsOf('git commit --no-edit && git log -n 3')).toEqual([
      ['git', 'commit', '--no-edit'],
      ['git', 'log', '-n', '3'],
    ])
  })

  it('splits at ; into separate segments', () => {
    expect(segmentsOf('git commit -m x ; git log -n 3')).toEqual([
      ['git', 'commit', '-m', 'x'],
      ['git', 'log', '-n', '3'],
    ])
  })

  it('splits at a pipe', () => {
    expect(segmentsOf('git commit -m x | tee log')).toEqual([
      ['git', 'commit', '-m', 'x'],
      ['tee', 'log'],
    ])
  })

  it('starts a new segment at a second git on the same line (collapsed newline)', () => {
    expect(segmentsOf('git commit -m x\ngit log -n 3')).toEqual([
      ['git', 'commit', '-m', 'x'],
      ['git', 'log', '-n', '3'],
    ])
  })

  it('isolates a git invocation inside a command substitution', () => {
    expect(segmentsOf('echo $(git commit -n)')).toEqual([
      ['echo', '$'],
      ['git', 'commit', '-n'],
    ])
  })

  it('keeps a leading non-git command in its own segment', () => {
    expect(segmentsOf('sudo git commit -n')).toEqual([
      ['sudo'],
      ['git', 'commit', '-n'],
    ])
  })

  it('does not split a quoted value that contains an operator', () => {
    expect(segmentsOf('git commit -m "a && b"')).toEqual([
      ['git', 'commit', '-m', 'a && b'],
    ])
  })
})
