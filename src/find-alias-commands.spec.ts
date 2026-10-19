import { describe, it, expect } from 'vitest'
import { findAliasCommands } from './find-alias-commands.js'

describe('findAliasCommands', () => {
  it('reads a -c alias definition as a git command', () => {
    expect(findAliasCommands('git -c alias.ci="commit -q" ci -m x')).toEqual([
      'git commit -q',
    ])
  })

  it('reads a git config alias definition', () => {
    expect(
      findAliasCommands('git config --global alias.ci "commit -q"')
    ).toEqual(['git commit -q'])
  })

  it('reads a shell alias without its leading !', () => {
    expect(findAliasCommands(`git -c alias.x='!sh -c "echo hi"' x`)).toEqual([
      'sh -c "echo hi"',
    ])
  })

  it('matches the alias key in any letter case', () => {
    expect(findAliasCommands('git -c ALIAS.ci=commit ci')).toEqual([
      'git commit',
    ])
  })

  it('finds nothing when no alias is defined', () => {
    expect(findAliasCommands('git commit -m "alias.x=y"')).toEqual([])
  })
})
