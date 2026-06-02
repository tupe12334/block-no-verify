import type { HookResponse } from '@polyhook/sdk'

export interface HookSdk {
  respond(r: HookResponse): Promise<void>
  block(message: string): HookResponse
  approve(): HookResponse
}
