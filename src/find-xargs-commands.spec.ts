import { describe, it, expect } from 'vitest'
import { findXargsCommands } from './find-xargs-commands.js'

const NV = '--no-' + 'verify'

describe('findXargsCommands', () => {
  it.each([
    // The replace string is the piped line, in the command's arguments.
    [
      ['-I{}', 'bash', '-c', '{}'],
      `git commit -q -m x ${NV}`,
      [`bash -c 'git commit -q -m x ${NV}'`],
    ],
    [
      ['-I', '{}', 'sh', '-c', 'echo {}'],
      `git push ${NV}`,
      [`sh -c 'echo git push ${NV}'`],
    ],
    [['-i', 'sh', '-c', '{}'], 'git push', ["sh -c 'git push'"]],
    [['--replace={}', 'bash', '-c', '{}'], 'git push', ["bash -c 'git push'"]],
    // Without a replace string, the piped words are appended.
    [['git'], `commit -m x ${NV}`, [`git commit -m x ${NV}`]],
    [['-n', '1', 'git'], 'commit', ['git commit']],
    [['-r', '-t', 'git'], 'commit -q', ['git commit -q']],
    [['-P', '4', 'git'], 'commit', ['git commit']],
    // -0 keeps the whole input as one argument.
    [['-0', 'git', 'commit'], 'x y', ["git commit 'x y'"]],
    // Each line is one item with -I.
    [
      ['-I{}', 'git', 'commit', '{}'],
      `-m a\n-m b`,
      ["git commit '-m a'", "git commit '-m b'"],
    ],
  ])('reads xargs %j with piped %j', (args, piped, commands) => {
    expect(findXargsCommands(args, piped)).toEqual(commands)
  })

  it('finds no command without an xargs command word', () => {
    expect(findXargsCommands([], 'git commit')).toEqual([])
    expect(findXargsCommands(['-0'], 'git commit')).toEqual([])
  })
})
