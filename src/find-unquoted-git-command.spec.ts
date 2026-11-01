import { describe, it, expect } from 'vitest'
import { findUnquotedGitCommand } from './find-unquoted-git-command.js'

describe('findUnquotedGitCommand', () => {
  it('should detect git.exe split by quotes', () => {
    expect(findUnquotedGitCommand("g''it.exe commit")).toBe('commit')
  })

  it('should detect a sub-command after a glob word', () => {
    expect(findUnquotedGitCommand("g''it add *.ts; g''it push")).toBe('push')
  })

  it('should not detect a sub-command after a comment ends the statement', () => {
    expect(findUnquotedGitCommand("g''it status # commit")).toBeNull()
  })

  it('should return null when no word unquotes to git', () => {
    expect(findUnquotedGitCommand("ech''o commit")).toBeNull()
  })
})
