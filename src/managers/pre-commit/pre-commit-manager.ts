import type { Manager } from '../manager.js'
import { hasPreCommitSkip } from './has-pre-commit-skip.js'

/**
 * Guards against the pre-commit framework's `SKIP` environment variable,
 * which skips one or more hooks when set to a non-empty value.
 */
export const preCommitManager: Manager = {
  name: 'pre-commit',
  detect: hasPreCommitSkip,
  reason: gitCommand =>
    `Setting SKIP= disables pre-commit framework hooks for git ${gitCommand}. Git hooks must not be bypassed.`,
}
