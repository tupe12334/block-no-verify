import { describe, it, expect } from 'vitest'
import { preprocessCommand } from './preprocess-command.js'

describe('preprocessCommand', () => {
  it('removes a comment so the next line is code', () => {
    expect(preprocessCommand("echo ok # it's\ngit commit")).toBe(
      'echo ok \ngit commit'
    )
  })
})
