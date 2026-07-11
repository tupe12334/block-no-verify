/**
 * Checks if the input disables or skips lefthook git hooks via an environment
 * variable. lefthook is fully disabled when `LEFTHOOK` is set to `0` or
 * `false`, and tagged hooks are skipped when `LEFTHOOK_EXCLUDE` is set to a
 * non-empty tag list. All are hook bypasses equivalent to `--no-verify`.
 *
 * The assignment must sit at the start of input or right after a shell
 * separator/space, so unrelated variables such as `OTHER_LEFTHOOK=0` are not
 * matched. `LEFTHOOK=1` (any non-disabling value) leaves hooks enabled, and an
 * empty `LEFTHOOK_EXCLUDE=` excludes nothing, so neither is flagged.
 * @param input - The command string to scan.
 * @returns True when a lefthook-disabling env var is detected.
 * @see https://github.com/evilmartians/lefthook/blob/master/internal/command/run.go
 * @see https://github.com/evilmartians/lefthook/blob/master/internal/config/loader.go
 */
export function hasLefthookSkip(input: string): boolean {
  const disabled =
    /(?:^|[\s;&|(])LEFTHOOK=(?:"0"|'0'|0|"false"|'false'|false)(?=$|[\s;&|)])/.test(
      input
    )
  const excluded =
    /(?:^|[\s;&|(])LEFTHOOK_EXCLUDE=(?:"[^"]+"|'[^']+'|[^\s;&|)"'][^\s;&|)]*)(?=$|[\s;&|)])/.test(
      input
    )
  return disabled || excluded
}
