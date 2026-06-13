import type { Manager } from '../manager.js'
import { hasHuskySkip } from './has-husky-skip.js'

/**
 * Guards against husky's `HUSKY=0` environment override, which disables all
 * husky git hooks for the command.
 */
export const huskyManager: Manager = {
  name: 'husky',
  detect: hasHuskySkip,
  reason: gitCommand =>
    `Setting HUSKY=0 disables husky git hooks for git ${gitCommand}. Git hooks must not be bypassed.`,
}
