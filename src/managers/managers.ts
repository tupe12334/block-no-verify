import type { Manager } from './manager.js'
import { huskyManager } from './husky/husky-manager.js'

/**
 * All registered tool-specific managers. Add a new tool's manager here to
 * have it checked by `detectManagerBypass` — no change to `check-command.ts`
 * is required.
 */
export const managers: Manager[] = [huskyManager]
