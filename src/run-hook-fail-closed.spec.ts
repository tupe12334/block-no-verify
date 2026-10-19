import { describe, it, expect, vi } from 'vitest'
import type { HookEvent, HookResponse } from '@polyhook/sdk'
import { runHook } from './run-hook.js'
import type { HookSdk } from './hook-sdk.js'

function makeSdk(): HookSdk {
  return {
    respond: vi.fn().mockResolvedValue(undefined),
    block: vi.fn(
      (message: string): HookResponse => ({ action: 'block', message })
    ),
    approve: vi.fn((): HookResponse => ({ action: 'approve' })),
  }
}

function bashEvent(command: string): HookEvent {
  return {
    event: 'tool:before',
    sessionId: 'test-session',
    caller: 'claude-code',
    tool: 'Bash',
    input: { command },
    output: null,
  }
}

// An unterminated `${` makes the tokenizer throw; bash still runs the outer
// command, so the hook must block rather than crash (#97).
describe('runHook: fails closed when the command cannot be parsed', () => {
  it.each([
    'git commit --no-verify -m x $(echo ${)',
    'git commit --no-verify -m x `echo ${`',
    'git status $(echo ${)',
  ])('blocks %s', async command => {
    const sdk = makeSdk()
    const result = await runHook(bashEvent(command), sdk)
    expect(result.blocked).toBe(true)
    expect(result.reason).toContain('could not parse')
    expect(sdk.block).toHaveBeenCalled()
    expect(sdk.approve).not.toHaveBeenCalled()
  })
})
