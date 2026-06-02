import type { HookEvent, HookResponse } from '@polyhook/sdk'

export interface HookSdk {
  read(): Promise<HookEvent>
  respond(r: HookResponse): Promise<void>
  block(message: string): HookResponse
  approve(): HookResponse
}
