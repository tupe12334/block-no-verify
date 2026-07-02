import { describe, it, expect } from 'vitest'
import { findSubCommand } from './find-git-subcommand.js'

describe('findSubCommand', () => {
  it('finds a plain sub-command right after git', () => {
    expect(findSubCommand('git push origin main', 3)).toBe('push')
  })

  it('finds a sub-command past unrelated flags (raw scan)', () => {
    expect(findSubCommand('git -C /some/path commit -m "test"', 3)).toBe(
      'commit'
    )
  })

  it('finds a sub-command broken up by double quotes via the tokenized fallback', () => {
    expect(findSubCommand('git "push" --no-verify origin main', 3)).toBe('push')
  })

  it('finds a sub-command split across adjacent double quotes', () => {
    expect(findSubCommand('git pu"sh" --no-verify origin main', 3)).toBe('push')
  })

  it('finds a sub-command split across adjacent single quotes', () => {
    expect(findSubCommand("git p'us'h --no-verify origin main", 3)).toBe('push')
  })

  it('does not match a sub-command name that only appears after a `;`-chained command', () => {
    expect(findSubCommand('git status; echo commit', 3)).toBeNull()
  })

  it('returns null when no sub-command is present', () => {
    expect(findSubCommand('git status', 3)).toBeNull()
  })

  it('does not match a word that merely contains a sub-command name', () => {
    expect(findSubCommand('git uncommitted', 3)).toBeNull()
  })
})
