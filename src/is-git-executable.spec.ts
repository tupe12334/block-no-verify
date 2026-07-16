import { describe, it, expect } from 'vitest'
import { isGitExecutable } from './is-git-executable.js'

describe('isGitExecutable', () => {
  it('matches bare git', () => {
    expect(isGitExecutable('git')).toBe(true)
  })

  it('matches git.exe', () => {
    expect(isGitExecutable('git.exe')).toBe(true)
  })

  it('matches an absolute posix path', () => {
    expect(isGitExecutable('/usr/bin/git')).toBe(true)
  })

  it('matches a relative path', () => {
    expect(isGitExecutable('./git')).toBe(true)
  })

  it('matches a windows path to git.exe', () => {
    expect(isGitExecutable('C:\\Program Files\\Git\\git.exe')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isGitExecutable('GIT')).toBe(true)
  })

  it('does not match a token that merely starts with git', () => {
    expect(isGitExecutable('github')).toBe(false)
  })

  it('does not match git-message.txt (a value, not the executable)', () => {
    expect(isGitExecutable('git-message.txt')).toBe(false)
  })

  it('does not match an unrelated command', () => {
    expect(isGitExecutable('kubectl')).toBe(false)
  })
})
