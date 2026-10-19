import { describe, it, expect } from 'vitest'
import { findFedScripts } from './find-fed-scripts.js'

describe('findFedScripts', () => {
  it.each([
    ["echo 'git status' | sh", ['git status']],
    ["printf '%s' 'git push' | /bin/bash", ['%s git push']],
    ["bash <<< 'git status'", ['git status']],
  ])('reads %s', (input, scripts) => {
    expect(findFedScripts(input)).toEqual(scripts)
  })

  it.each([
    "echo 'git status' | grep git",
    'cat file | sh',
    "grep x <<< 'git status'",
    "echo 'a' && sh",
  ])('finds nothing in %s', input => {
    expect(findFedScripts(input)).toEqual([])
  })
})
