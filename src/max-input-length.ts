/**
 * Longest text, in characters, that block-no-verify checks. A longer command,
 * or a command whose variable expansion grows past this, is blocked instead
 * of checked, so a check never runs past the hook timeout.
 */
export const MAX_INPUT_LENGTH = 100_000
