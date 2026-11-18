import { describe, it, expect } from 'vitest'
import { isMessageProgram } from './is-message-program.js'

describe('isMessageProgram', () => {
  it('accepts git and gh, with a path or .exe', () => {
    for (const word of ['git', 'gh', '/usr/bin/git', 'C:\\bin\\GH.EXE']) {
      expect(isMessageProgram(word)).toBe(true)
    }
  })

  it('rejects other programs', () => {
    for (const word of ['echo', 'parallel', 'github', 'bash']) {
      expect(isMessageProgram(word)).toBe(false)
    }
  })
})
