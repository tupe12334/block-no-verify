import { describe, it, expect } from 'vitest'
import { findDerivedCommands } from './find-derived-commands.js'

describe('findDerivedCommands', () => {
  it('collects shell, fed and interpreter command strings', () => {
    expect(
      findDerivedCommands(`bash -c "a" && echo 'b' | sh && python3 -c "x('c')"`)
    ).toEqual(['a', 'b', 'c'])
  })
})
