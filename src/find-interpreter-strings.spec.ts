import { describe, it, expect } from 'vitest'
import { findInterpreterStrings } from './find-interpreter-strings.js'

describe('findInterpreterStrings', () => {
  it.each([
    [`python3 -c "import os; os.system('git status')"`, ['git status']],
    [`perl -e 'system("git push")'`, ['git push']],
    [
      `node -e "require('child_process').execSync('git log')"`,
      ['child_process', 'git log', 'child_process git log'],
    ],
    [`/usr/bin/python3.12 -c "print('a', \\"b\\")"`, ['a', 'b', 'a b']],
    [`ruby -e 'system "git fetch"'`, ['git fetch']],
    [`perl -e 'system qq{git push}'`, ['git push']],
    [`ruby -e '%x(git log)'`, ['git log']],
    [`python3 -c 'q-1; os.system("git log")'`, ['git log']],
  ])('reads %s', (input, literals) => {
    expect(findInterpreterStrings(input)).toEqual(literals)
  })

  it.each(['python3 script.py', 'node -v', 'echo -e "a"', 'perl -ne print'])(
    'finds nothing in %s',
    input => {
      expect(findInterpreterStrings(input)).toEqual([])
    }
  )
})
