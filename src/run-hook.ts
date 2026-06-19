import type { HookEvent } from '@polyhook/sdk'
import type { CheckResult } from './check-result.js'
import type { HookSdk } from './hook-sdk.js'
import { checkCommand } from './index.js'

/**
 * Event kinds that are never a pending tool call: they fire after a tool has
 * already run or relate to session lifecycle, so there is nothing to block.
 */
const NON_TOOL_EVENTS = new Set<HookEvent['event']>([
  'tool:after',
  'session:start',
  'session:stop',
  'agent:stop',
])

/**
 * Decides whether an event represents a pending tool call worth inspecting.
 *
 * polyhook normalizes recognized callers to the `tool:before` event. When the
 * caller-identifying field is absent from the wire format (for example a
 * Claude Code `PreToolUse` event piped without its `hook_event_name`), polyhook
 * falls back to labelling the event `notification` while still extracting the
 * tool name and input. Treat such an event as a tool call too, as long as it
 * is not an explicit post-tool / session event and actually carries a tool —
 * genuine notifications have no tool and are left untouched.
 * @param event - The normalized hook event.
 * @returns Whether the event should be checked for a hook bypass.
 */
function isToolCall(event: HookEvent): boolean {
  if (event.event === 'tool:before') {
    return true
  }
  if (NON_TOOL_EVENTS.has(event.event)) {
    return false
  }
  if (event.output !== null && event.output !== undefined) {
    return false
  }
  return typeof event.tool === 'string' && event.tool.length > 0
}

/**
 * Runs the hook logic for a polyhook event.
 * @param event - The hook event received from the AI agent runtime.
 * @param sdk - The SDK helpers used to approve or block the tool call.
 * @returns The check result, so callers can set the process exit code.
 */
export async function runHook(
  event: HookEvent,
  sdk: HookSdk
): Promise<CheckResult> {
  if (!isToolCall(event)) {
    await sdk.respond(sdk.approve())
    return { blocked: false }
  }

  const rawTool = event.tool
  const toolName =
    rawTool === null || rawTool === undefined ? undefined : rawTool

  const rawInput = event.input
  const rawCommand =
    rawInput === null || rawInput === undefined ? undefined : rawInput.command
  const command = typeof rawCommand === 'string' ? rawCommand : ''

  const options = toolName !== undefined ? { toolName } : undefined
  const result = checkCommand(command, options)

  if (result.blocked) {
    const reason = result.reason !== undefined ? result.reason : ''
    await sdk.respond(sdk.block(reason))
  } else {
    await sdk.respond(sdk.approve())
  }

  return result
}
