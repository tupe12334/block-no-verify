/**
 * Checks if the input sets the `HUSKY=0` environment variable, which husky
 * uses to disable all git hooks for the command. This is a bypass equivalent
 * to `--no-verify` for projects that use husky.
 *
 * Only the literal value `0` disables husky, so other values (e.g. `HUSKY=1`)
 * are not flagged. The assignment must sit at the start of input or right
 * after a shell separator/space, so unrelated variables such as `OTHER_HUSKY=0`
 * are not matched. A leading `export`/`env` keyword is handled implicitly by
 * the separator before `HUSKY`.
 *
 * @see https://typicode.github.io/husky/how-to.html
 */
export function hasHuskySkip(input: string): boolean {
  // Match: HUSKY=0, HUSKY="0", HUSKY='0' at the start or after a separator,
  // with the value followed by end-of-input or another separator.
  return /(?:^|[\s;&|(])HUSKY=(?:"0"|'0'|0)(?=$|[\s;&|)])/.test(input)
}
