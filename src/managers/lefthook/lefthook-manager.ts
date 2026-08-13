import type { Manager } from '../manager.js'
import { hasLefthookSkip } from './has-lefthook-skip.js'

/**
 * Guards against lefthook's environment overrides (`LEFTHOOK=0`,
 * `LEFTHOOK=false`, `LEFTHOOK_EXCLUDE=<tags>`), which disable or skip lefthook
 * git hooks for the command.
 */
export const lefthookManager: Manager = {
  name: 'lefthook',
  detect: hasLefthookSkip,
  reason: gitCommand =>
    `Setting LEFTHOOK=0 (or LEFTHOOK=false / LEFTHOOK_EXCLUDE) disables or skips lefthook git hooks for git ${gitCommand}. Git hooks must not be bypassed.`,
}
