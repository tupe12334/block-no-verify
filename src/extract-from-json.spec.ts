import { describe, expect, it } from 'vitest'
import { tryExtractFromJson } from './extract-from-json.js'

describe('tryExtractFromJson', () => {
  it('extracts command from Claude Code tool_input shape', () => {
    const input = JSON.stringify({
      tool_input: { command: 'git commit --no-verify' },
    })
    expect(tryExtractFromJson(input)).toEqual({
      command: 'git commit --no-verify',
      toolName: null,
    })
  })

  it('extracts tool_name alongside the command', () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git commit' },
    })
    expect(tryExtractFromJson(input)).toEqual({
      command: 'git commit',
      toolName: 'Bash',
    })
  })

  it('surfaces tool_name even when tool_input has no command', () => {
    const input = JSON.stringify({
      tool_name: 'mcp__github__push_files',
      tool_input: { owner: 'o', repo: 'r' },
    })
    expect(tryExtractFromJson(input)).toEqual({
      command: null,
      toolName: 'mcp__github__push_files',
    })
  })

  it('extracts generic command fields', () => {
    expect(
      tryExtractFromJson(JSON.stringify({ cmd: 'git merge --no-verify' }))
    ).toEqual({ command: 'git merge --no-verify', toolName: null })
  })

  it('returns tool_name only when no command field exists', () => {
    const input = JSON.stringify({ tool_name: 'mcp__github__delete_file' })
    expect(tryExtractFromJson(input)).toEqual({
      command: null,
      toolName: 'mcp__github__delete_file',
    })
  })

  it('returns null for invalid JSON', () => {
    expect(tryExtractFromJson('{invalid')).toBeNull()
  })

  it('returns null for JSON without recognized fields', () => {
    expect(tryExtractFromJson(JSON.stringify({ foo: 'bar' }))).toBeNull()
  })

  it('returns null for non-object JSON', () => {
    expect(tryExtractFromJson('"hello"')).toBeNull()
    expect(tryExtractFromJson('42')).toBeNull()
    expect(tryExtractFromJson('null')).toBeNull()
  })

  it('ignores non-string command values', () => {
    expect(tryExtractFromJson(JSON.stringify({ command: 123 }))).toBeNull()
  })
})
