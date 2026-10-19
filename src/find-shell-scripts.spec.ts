import { describe, it, expect } from 'vitest'
import { findShellScripts } from './find-shell-scripts.js'

describe('findShellScripts', () => {
  it.each([
    ['bash -c "git status"', ['git status']],
    ["sh -c 'echo a; git push'", ['echo a; git push']],
    ['/bin/zsh -lc "make"', ['make']],
    ['sudo bash -ec "ls"', ['ls']],
    ['bash -c "a" && sh -c "b"', ['a', 'b']],
  ])('reads %s', (input, scripts) => {
    expect(findShellScripts(input)).toEqual(scripts)
  })

  it.each(['bash script.sh', 'echo -c "x"', 'grep -c bash file'])(
    'finds nothing in %s',
    input => {
      expect(findShellScripts(input)).toEqual([])
    }
  )
})
