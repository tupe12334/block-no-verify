import { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'

/**
 * Type representing git commands that support --no-verify
 */
export type GitCommand = (typeof GIT_COMMANDS_WITH_NO_VERIFY)[number]
