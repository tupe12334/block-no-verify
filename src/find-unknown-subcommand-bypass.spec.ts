import { describe, it, expect } from 'vitest'
import { findUnknownSubcommandBypass } from './find-unknown-subcommand-bypass.js'

describe('findUnknownSubcommandBypass', () => {
  it.each([
    ['git ci --no-verify -m x', 'ci'],
    ['sudo git ci --no-verify', 'ci'],
    ['git add . && git p --no-verify', 'p'],
  ])('flags %s', (input, subcommand) => {
    expect(findUnknownSubcommandBypass(input)).toBe(subcommand)
  })

  it.each([
    // Built-ins can never be aliases.
    'git grep -- --no-verify',
    'git grep -e --no-verify',
    'git grep "--no-verify"',
    'git log -S --no-verify',
    'git log --grep --no-verify',
    // Words after -- are data.
    'git ci -- --no-verify',
    'git ci -m "--no-verify"',
    'git status',
  ])('allows %s', input => {
    expect(findUnknownSubcommandBypass(input)).toBeNull()
  })
})
