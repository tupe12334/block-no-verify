#!/usr/bin/env node
/* eslint-disable ddd/require-spec-file */
import { createRequire } from 'node:module'
import type { HookEvent, HookResponse } from '@polyhook/sdk'
import { EXIT_CODES } from './exit-codes.js'
import { runHook } from './run-hook.js'

interface PolyhookSdk {
  read: () => Promise<HookEvent>
  respond: (r: HookResponse) => Promise<void>
  block: (message: string) => HookResponse
  approve: () => HookResponse
}

// ponytail: load the SDK's CommonJS entry. Its ESM entry (dist/index.js) has no
// "type": "module" and Node 18 cannot parse it, so the ESM import fails there.
const requireSdk = createRequire(import.meta.url)
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- createRequire returns any; typed here against the SDK surface
const sdk: PolyhookSdk = requireSdk('@polyhook/sdk')
const { read, respond, block, approve } = sdk

/**
 * Entry point: reads a polyhook event from stdin and responds via the SDK.
 *
 * When a command is blocked the SDK response is written to stdout (for callers
 * that read it) and the reason is additionally printed to stderr with a
 * non-zero exit code. Claude Code only treats a `PreToolUse` hook as blocking
 * when it exits with code 2 and surfaces stderr to the model, so the exit code
 * is what actually stops the bypass.
 */
async function main(): Promise<void> {
  const event = await read()
  const result = await runHook(event, { respond, block, approve })

  if (!result.blocked) {
    return
  }

  if (result.reason !== undefined && result.reason !== '') {
    console.error(result.reason)
  }
  process.exit(EXIT_CODES.BLOCKED)
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  console.error('Error:', message)
  process.exit(EXIT_CODES.ERROR)
})
