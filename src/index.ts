/**
 * block-no-verify
 *
 * A security tool that blocks the --no-verify flag in git commands.
 * Designed to prevent AI agents from bypassing git hooks.
 */

export { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'
export type { GitCommand } from './git-command.js'
export type { CheckResult } from './check-result.js'
export { EXIT_CODES } from './exit-codes.js'
export { detectGitCommand } from './detect-git-command.js'
export { hasNoVerifyFlag } from './has-no-verify-flag.js'
export { checkCommand } from './check-command.js'
export { parseInput } from './parse-input.js'
export type { InputFormat } from './input-format.js'
export type { ParseResult } from './parse-result.js'
