import type { HookEvent } from '@polyhook/sdk'
import type { HookSdk } from './hook-sdk.js'
import { checkCommand } from './index.js'

/**
 * Runs the hook logic for a polyhook event.
 * @param event - The hook event received from the AI agent runtime.
 * @param sdk - The SDK helpers used to approve or block the tool call.
 */
export async function runHook(event: HookEvent, sdk: HookSdk): Promise<void> {
  if (event.event !== 'tool:before') {
    await sdk.respond(sdk.approve())
    return
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
}
