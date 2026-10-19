import { describe, it, expect } from 'vitest'
import { findFedScripts } from './find-fed-scripts.js'

describe('findFedScripts', () => {
  it.each([
    ["echo 'git status' | sh", ['git status']],
    ["printf '%s' 'git push' | /bin/bash", ['%s git push']],
    ["bash <<< 'git status'", ['git status']],
    // Wrappers before the shell, and pass-through stages.
    ["echo 'git status' | sudo sh", ['git status']],
    ["echo 'git status' | env A=1 bash", ['git status']],
    ["echo 'git status' | timeout 5 sh", ['git status']],
    ["echo 'git status' |& sh", ['git status']],
    ["echo 'git status' | tee log | sh", ['git status']],
    ["echo 'git status' | cat | head -n 1 | sh", ['git status']],
    ["cat <<< 'git status' | sh", ['git status']],
    // Wrapper options with a value, and more wrappers.
    ["echo 'git status' | sudo -u root sh", ['git status']],
    ["echo 'git status' | timeout -s KILL 5 sh", ['git status']],
    ["echo 'git status' | time sh", ['git status']],
    ["echo 'git status' | nohup sh", ['git status']],
    ["echo 'git status' | doas -u root sh", ['git status']],
  ])('reads %s', (input, scripts) => {
    expect(findFedScripts(input)).toEqual(scripts)
  })

  it.each([
    "echo 'git status' | grep git",
    'cat file | sh',
    "grep x <<< 'git status'",
    "echo 'a' && sh",
    "echo 'git status' | grep sh",
    "echo 'git status' | sudo tee /etc/x",
  ])('finds nothing in %s', input => {
    expect(findFedScripts(input)).toEqual([])
  })
})
