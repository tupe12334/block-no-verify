import { describe, it, expect } from 'vitest'
import { findLiveSubstitutions } from './find-live-substitutions.js'

describe('findLiveSubstitutions', () => {
  it.each([
    ['echo $(git commit)', ['git commit']],
    ['echo `git commit`', ['git commit']],
    ['echo "$(git commit)"', ['git commit']],
    ["echo '$(git commit)'", []],
    ['echo \\`git commit`', []],
    ['echo "$(printf \')\'; git commit)"', ["printf ')'; git commit"]],
    ['cat <(git commit)', ['git commit']],
    ['echo `echo \\`git commit\\``', ['echo `git commit`', 'git commit']],
  ])('%s', (input, found) => {
    expect(findLiveSubstitutions(input)).toEqual(found)
  })
})
