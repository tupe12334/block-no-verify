import { describe, it, expect } from 'vitest'
import { parse } from 'shell-quote'
import { gitSubcommandOf } from './git-subcommand-of.js'

const subcommandOf = (input: string): string | null =>
  gitSubcommandOf(parse(input))

describe('gitSubcommandOf', () => {
  it('returns the subcommand of a plain git invocation', () => {
    expect(subcommandOf('git commit -m x')).toBe('commit')
  })

  it('returns null for a non-git segment', () => {
    expect(subcommandOf('kubectl logs -n kube-system')).toBeNull()
  })

  it('returns null when there is no subcommand', () => {
    expect(subcommandOf('git')).toBeNull()
  })

  it('skips the value of the -C global option', () => {
    expect(subcommandOf('git -C /path commit -m x')).toBe('commit')
  })

  it('skips the value of the -c global option', () => {
    expect(subcommandOf('git -c core.hooksPath=/dev/null commit')).toBe(
      'commit'
    )
  })

  it('skips other global flags', () => {
    expect(subcommandOf('git --no-pager log')).toBe('log')
  })

  it('resolves the subcommand when git is given by path', () => {
    expect(subcommandOf('/usr/bin/git push origin main')).toBe('push')
  })
})
