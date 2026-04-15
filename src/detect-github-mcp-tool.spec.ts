import { describe, expect, it } from 'vitest'
import { detectBlockedGithubMcpTool } from './detect-github-mcp-tool.js'

describe('detectBlockedGithubMcpTool', () => {
  describe('blocked tools', () => {
    it.each([
      'mcp__github__create_or_update_file',
      'mcp__github__delete_file',
      'mcp__github__push_files',
      'mcp__github__merge_pull_request',
      'mcp__github__update_pull_request_branch',
    ])('detects %s as blocked', toolName => {
      expect(detectBlockedGithubMcpTool(toolName)).toBe(toolName)
    })

    it('trims whitespace before matching', () => {
      expect(detectBlockedGithubMcpTool('  mcp__github__push_files  ')).toBe(
        'mcp__github__push_files'
      )
    })
  })

  describe('allowed tools', () => {
    it.each([
      'Bash',
      'Read',
      'Edit',
      'mcp__github__get_file_contents',
      'mcp__github__list_pull_requests',
      'mcp__github__search_code',
      'mcp__other__push_files',
    ])('returns null for %s', toolName => {
      expect(detectBlockedGithubMcpTool(toolName)).toBeNull()
    })

    it('returns null for undefined', () => {
      expect(detectBlockedGithubMcpTool(undefined)).toBeNull()
    })

    it('returns null for null', () => {
      expect(detectBlockedGithubMcpTool(null)).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(detectBlockedGithubMcpTool('')).toBeNull()
    })
  })
})
