/**
 * Checks if the input sets the `LEFTHOOK=0` environment variable, which
 * lefthook uses to disable all git hooks for the command.
 *
 * Only the literal value `0` disables lefthook; other values do not.
 * @param input - The command string to scan.
 * @returns True when LEFTHOOK=0 is detected in the command.
 * @see https://lefthook.com/reference/env-variables
 */
export function hasLefthookSkip(input: string): boolean {
  return /(?:^|[\s;&|(])LEFTHOOK=(?:"0"|'0'|0)(?=$|[\s;&|)])/.test(input)
}
