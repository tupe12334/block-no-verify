import type { Manager } from './manager.js'
import { huskyManager } from './husky/husky-manager.js'
import { lefthookManager } from './lefthook/lefthook-manager.js'
import { overcommitManager } from './overcommit/overcommit-manager.js'
import { preCommitManager } from './pre-commit/pre-commit-manager.js'

/**
 * All registered tool-specific managers. Add a new tool's manager here to
 * have it checked by `detectManagerBypass` — no change to `check-command.ts`
 * is required.
 */
export const managers: Manager[] = [
  huskyManager,
  lefthookManager,
  overcommitManager,
  preCommitManager,
]
