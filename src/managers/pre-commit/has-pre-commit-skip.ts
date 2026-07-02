/**
 * Checks if the input sets the `SKIP` environment variable used by the
 * pre-commit framework to skip one or more hooks. A non-empty `SKIP` value
 * disables the named hooks (or all hooks when set to `*`) for the command.
 *
 * The variable must appear at the start of input or right after a shell
 * separator to avoid matching unrelated variables that contain "SKIP" as a
 * suffix (e.g. `NO_SKIP=pre-push`).
 * @param input - The command string to scan.
 * @returns True when a non-empty SKIP= assignment is detected.
 * @see https://pre-commit.com/#temporarily-disabling-hooks
 */
export function hasPreCommitSkip(input: string): boolean {
  // SKIP= with a non-empty, non-whitespace value disables pre-commit hooks.
  return /(?:^|[\s;&|(])SKIP=(?:"[^"\s]+"|'[^'\s]+'|[^\s;&|]+)(?=$|[\s;&|)])/.test(
    input
  )
}
