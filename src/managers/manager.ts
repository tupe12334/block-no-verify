import type { GitCommand } from '../git-command.js'

/**
 * A manager guards against a single tool that can disable git hooks in its
 * own way (separate from the generic git-flag checks). Each tool-specific
 * rule under `src/managers/` implements this shape and is registered in
 * `src/managers/index.ts`.
 */
export interface Manager {
  /** Identifier for the tool this manager guards (e.g. `husky`). */
  name: string
  /** Returns true if the input uses this tool to bypass git hooks. */
  detect(input: string): boolean
  /**
   * Core block reason for this manager, without the leading `BLOCKED:` label
   * or the shared false-positive note — both are added by the caller.
   */
  reason(gitCommand: GitCommand): string
}
