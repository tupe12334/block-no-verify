import { describe, it, expect } from 'vitest'
import { subcommandValueOptions } from './subcommand-value-options.js'

describe('subcommandValueOptions', () => {
  it.each(['-m', '--message', '-F', '-C', '-c', '-t', '--fixup', '--squash'])(
    'commit %s takes a value',
    option => {
      expect(subcommandValueOptions('commit').has(option)).toBe(true)
    }
  )

  it.each([
    ['merge', '-m'],
    ['merge', '--file'],
    ['cherry-pick', '-m'],
    ['rebase', '-C'],
    ['am', '-C'],
  ] as const)('%s %s takes a value', (command, option) => {
    expect(subcommandValueOptions(command).has(option)).toBe(true)
  })

  it.each([
    ['rebase', '-m'],
    ['am', '-m'],
    ['am', '-c'],
    ['merge', '--squash'],
    ['cherry-pick', '-F'],
    ['push', '-m'],
  ] as const)('%s %s takes no value', (command, option) => {
    expect(subcommandValueOptions(command).has(option)).toBe(false)
  })
})
