import type { Manager } from '../manager.js'
import { hasLefthookSkip } from './has-lefthook-skip.js'

/**
 * Guards against lefthook's `LEFTHOOK=0` environment override, which disables
 * all lefthook git hooks for the command.
 */
export const lefthookManager: Manager = {
  name: 'lefthook',
  detect: hasLefthookSkip,
  reason: gitCommand =>
    `Setting LEFTHOOK=0 disables lefthook git hooks for git ${gitCommand}. Git hooks must not be bypassed.`,
}
