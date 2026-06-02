import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { HookEvent, HookResponse } from '@polyhook/sdk'
import { runHook } from './run-hook.js'
import type { HookSdk } from './hook-sdk.js'

function makeApproveResponse(): HookResponse {
  return { action: 'approve' }
}

function makeBlockResponse(message: string): HookResponse {
  return { action: 'block', message }
}

function makeEvent(overrides: Partial<HookEvent>): HookEvent {
  return {
    event: 'tool:before',
    sessionId: 'test-session',
    caller: 'claude-code',
    tool: null,
    input: null,
    output: null,
    ...overrides,
  }
}

function makeSdk(): HookSdk {
  return {
    respond: vi.fn().mockResolvedValue(undefined),
    block: vi.fn(makeBlockResponse),
    approve: vi.fn(makeApproveResponse),
  }
}

describe('runHook', () => {
  describe('non-tool:before events', () => {
    it('should approve session:start', async () => {
      const sdk = makeSdk()
      const event = makeEvent({ event: 'session:start' })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
      expect(sdk.respond).toHaveBeenCalledWith(makeApproveResponse())
    })

    it('should approve tool:after', async () => {
      const sdk = makeSdk()
      const event = makeEvent({ event: 'tool:after' })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
    })

    it('should approve notification', async () => {
      const sdk = makeSdk()
      const event = makeEvent({ event: 'notification' })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
    })
  })

  describe('blocking commands', () => {
    it('should block git commit --no-verify', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'bash',
        input: { command: 'git commit --no-verify -m "test"' },
      })
      await runHook(event, sdk)
      expect(sdk.block).toHaveBeenCalled()
      expect(sdk.respond).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'block' })
      )
    })

    it('should block with reason containing BLOCKED', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'bash',
        input: { command: 'git commit --no-verify -m "test"' },
      })
      await runHook(event, sdk)
      const calls = vi.mocked(sdk.block).mock.calls
      expect(calls.length).toBe(1)
      expect(calls[0][0]).toContain('BLOCKED')
    })

    it('should block git push --no-verify', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'bash',
        input: { command: 'git push --no-verify origin main' },
      })
      await runHook(event, sdk)
      expect(sdk.block).toHaveBeenCalled()
    })

    it('should block git commit -n', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'bash',
        input: { command: 'git commit -n -m "test"' },
      })
      await runHook(event, sdk)
      expect(sdk.block).toHaveBeenCalled()
    })

    it('should block core.hooksPath override', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'bash',
        input: { command: 'git -c core.hooksPath=/dev/null commit -m "test"' },
      })
      await runHook(event, sdk)
      expect(sdk.block).toHaveBeenCalled()
    })

    it('should block mcp__github__push_files', async () => {
      const sdk = makeSdk()
      const event = makeEvent({ tool: 'mcp__github__push_files', input: {} })
      await runHook(event, sdk)
      expect(sdk.block).toHaveBeenCalled()
      const calls = vi.mocked(sdk.block).mock.calls
      expect(calls[0][0]).toContain('mcp__github__push_files')
    })

    it('should block mcp__github__create_or_update_file', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'mcp__github__create_or_update_file',
        input: {},
      })
      await runHook(event, sdk)
      expect(sdk.block).toHaveBeenCalled()
    })

    it('should block mcp__github__merge_pull_request', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'mcp__github__merge_pull_request',
        input: {},
      })
      await runHook(event, sdk)
      expect(sdk.block).toHaveBeenCalled()
    })
  })

  describe('allowing commands', () => {
    it('should approve safe git commit', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'bash',
        input: { command: 'git commit -m "safe"' },
      })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
      expect(sdk.block).not.toHaveBeenCalled()
    })

    it('should approve git push without --no-verify', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'bash',
        input: { command: 'git push origin main' },
      })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
    })

    it('should approve non-git commands', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'bash',
        input: { command: 'npm install' },
      })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
    })

    it('should approve null input', async () => {
      const sdk = makeSdk()
      const event = makeEvent({ tool: 'bash', input: null })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
    })

    it('should approve null tool', async () => {
      const sdk = makeSdk()
      const event = makeEvent({ tool: null, input: null })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
    })

    it('should approve read-only GitHub MCP tools', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'mcp__github__get_file_contents',
        input: {},
      })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should handle non-string command in input', async () => {
      const sdk = makeSdk()
      const event = makeEvent({ tool: 'bash', input: { command: 123 } })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
    })

    it('should handle missing command field in input', async () => {
      const sdk = makeSdk()
      const event = makeEvent({ tool: 'bash', input: { other: 'data' } })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
    })

    it('should handle git push -n (dry-run, not --no-verify)', async () => {
      const sdk = makeSdk()
      const event = makeEvent({
        tool: 'bash',
        input: { command: 'git push -n origin main' },
      })
      await runHook(event, sdk)
      expect(sdk.approve).toHaveBeenCalled()
    })
  })
})
