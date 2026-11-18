import { describe, it, expect } from 'vitest'
import { takesMessageValue } from './takes-message-value.js'

describe('takesMessageValue', () => {
  it.each([
    [['git', 'commit'], '-m'],
    [['git', 'commit', '-a'], '--message'],
    [['git', 'tag', '-a', 'v1'], '-m'],
    [['git', 'merge'], '-m'],
    [['git', 'notes', 'append'], '-m'],
    [['git', 'stash', 'save'], '--message'],
    [['gh', 'pr', 'create'], '--body'],
    [['gh', 'issue', 'edit'], '-t'],
    [['gh', 'release', 'edit', 'v1'], '--notes'],
  ])('accepts %j %s', (words, option) => {
    expect(takesMessageValue(words, option)).toBe(true)
  })

  it.each([
    [['git', 'rebase'], '-m'],
    [['git', 'cherry-pick'], '-m'],
    [['git', 'revert'], '-m'],
    [['git', '-C', '.', 'commit'], '-m'],
    [['git', 'stash'], '-m'],
    [['git', 'merge'], '--message'],
    [['gh', 'pr', 'comment'], '--title'],
    [['gh', 'release', 'create'], '-n'],
    [['gh', 'x'], '--message'],
    [['echo', 'commit'], '-m'],
  ])('rejects %j %s', (words, option) => {
    expect(takesMessageValue(words, option)).toBe(false)
  })
})
