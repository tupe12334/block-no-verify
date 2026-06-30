/**
 * Checks if the input sets the `OVERCOMMIT_DISABLE=1` environment variable,
 * which overcommit uses to disable all git hooks for the command.
 *
 * Only the literal value `1` disables overcommit; other values do not.
 * @param input - The command string to scan.
 * @returns True when OVERCOMMIT_DISABLE=1 is detected in the command.
 * @see https://github.com/sds/overcommit#disabling-overcommit
 */
export function hasOvercommitSkip(input: string): boolean {
  return /(?:^|[\s;&|(])OVERCOMMIT_DISABLE=(?:"1"|'1'|1)(?=$|[\s;&|)])/.test(
    input
  )
}
