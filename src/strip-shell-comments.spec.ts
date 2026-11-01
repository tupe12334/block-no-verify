import { describe, it, expect } from 'vitest'
import { stripShellComments } from './strip-shell-comments.js'

describe('stripShellComments', () => {
  it.each([
    ['echo hi # note\ngit commit', 'echo hi \ngit commit'],
    ["echo ok # it's\nx=1", 'echo ok \nx=1'],
    ['echo foo#bar', 'echo foo\\#bar'],
    ['echo $#', 'echo $#'],
    ['echo "a #b" # c', 'echo "a #b" '],
    ["echo '#' # c", "echo '#' "],
    ['echo \\#x', 'echo \\#x'],
  ])('%j', (input, output) => {
    expect(stripShellComments(input)).toBe(output)
  })
})
