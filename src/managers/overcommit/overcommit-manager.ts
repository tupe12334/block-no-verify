import type { Manager } from '../manager.js'
import { hasOvercommitSkip } from './has-overcommit-skip.js'

/**
 * Guards against overcommit's `OVERCOMMIT_DISABLE=1` environment override,
 * which disables all overcommit git hooks for the command.
 */
export const overcommitManager: Manager = {
  name: 'overcommit',
  detect: hasOvercommitSkip,
  reason: gitCommand =>
    `Setting OVERCOMMIT_DISABLE=1 disables overcommit git hooks for git ${gitCommand}. Git hooks must not be bypassed.`,
}
