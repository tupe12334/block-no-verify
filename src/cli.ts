#!/usr/bin/env node
/* eslint-disable ddd/require-spec-file */
import { createRequire } from 'node:module'
import type { HookSdk } from './hook-sdk.js'
import { runHook } from './run-hook.js'

const _require = createRequire(import.meta.url)
const sdk: HookSdk = _require('@polyhook/sdk')

async function main(): Promise<void> {
  const event = await sdk.read()
  await runHook(event, sdk)
}

main().catch(err => {
  const message = err instanceof Error ? err.message : String(err)
  console.error('Error:', message)
  process.exit(1)
})
