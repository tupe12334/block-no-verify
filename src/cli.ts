#!/usr/bin/env node
/* eslint-disable ddd/require-spec-file */
import { read, respond, block, approve } from '@polyhook/sdk'
import { runHook } from './run-hook.js'

/**
 * Entry point: reads a polyhook event from stdin and responds via the SDK.
 */
async function main(): Promise<void> {
  const event = await read()
  await runHook(event, { respond, block, approve })
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  console.error('Error:', message)
  process.exit(1)
})
