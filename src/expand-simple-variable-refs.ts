/**
 * Matches a simple `NAME=` assignment prefix anchored at the start of input
 * or right after a shell separator/space/opening-paren. The value itself is
 * read separately by {@link readAssignedValue} so this regex never needs an
 * alternation of optional capture groups.
 */
const ASSIGNMENT_NAME = /(?:^|[\s;&|(])([A-Za-z_][A-Za-z0-9_]*)=/g

const DOUBLE_QUOTED_VALUE = /^"([^"]*)"/
const SINGLE_QUOTED_VALUE = /^'([^']*)'/
const BARE_VALUE = /^[A-Za-z0-9_./:-]*/
const IDENTIFIER_CHAR = /[A-Za-z0-9_]/

/**
 * Reads the literal value of a `NAME=value` assignment starting right after
 * the `=`. Only plain, unquoted-looking values are recognized; anything more
 * elaborate (arrays, command substitution, unterminated quotes, etc.) reads
 * as an empty string and is left unexpanded by the caller.
 * @param rest - The command string starting right after the `=`.
 * @returns The literal assigned value, or `''` when it cannot be read.
 */
function readAssignedValue(rest: string): string {
  const doubleQuoted = DOUBLE_QUOTED_VALUE.exec(rest)
  if (doubleQuoted !== null) return doubleQuoted[1]
  const singleQuoted = SINGLE_QUOTED_VALUE.exec(rest)
  if (singleQuoted !== null) return singleQuoted[1]
  const bare = BARE_VALUE.exec(rest)
  if (bare === null) return ''
  return bare[0]
}

/**
 * Replaces every `$name` or `${name}` reference in `text` with `value`. The
 * bare `$name` form only matches when not immediately followed by another
 * identifier character, so `$cfoo` is never mistaken for a reference to `c`.
 * @param text - The string to scan and replace within.
 * @param name - The variable name being expanded.
 * @param value - The literal value to substitute in.
 * @returns `text` with every reference to `name` replaced by `value`.
 */
function replaceVariableRefs(
  text: string,
  name: string,
  value: string
): string {
  const braced = text.split(`\${${name}}`).join(value)
  const bare = `$${name}`
  let result = ''
  let i = 0
  while (i < braced.length) {
    if (
      braced.startsWith(bare, i) &&
      !IDENTIFIER_CHAR.test(braced.charAt(i + bare.length))
    ) {
      result += value
      i += bare.length
      continue
    }
    result += braced.charAt(i)
    i += 1
  }
  return result
}

/**
 * Performs a best-effort, textual expansion of trivial `NAME=value`
 * assignments referenced later in the same string as `$NAME`/`${NAME}`. This
 * mirrors what the shell already does before `git` ever runs, so hiding the
 * `git` executable or its sub-command behind a simple variable indirection
 * (e.g. `c=push; git $c --no-verify`) does not defeat detection. Only plain
 * literal values are substituted; this is not a real shell parser.
 * @param input - The raw command string.
 * @returns The command string with simple variable references replaced by
 *   their assigned literal value.
 */
export function expandSimpleVariableRefs(input: string): string {
  let result = input
  ASSIGNMENT_NAME.lastIndex = 0
  let match = ASSIGNMENT_NAME.exec(input)
  while (match !== null) {
    const name = match[1]
    const value = readAssignedValue(input.slice(match.index + match[0].length))
    if (value.length > 0) {
      result = replaceVariableRefs(result, name, value)
    }
    match = ASSIGNMENT_NAME.exec(input)
  }
  return result
}
