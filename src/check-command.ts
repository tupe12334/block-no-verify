import type { CheckCommandOptions } from './check-command-options.js'
import type { CheckResult } from './check-result.js'
import { checkCommandText } from './check-command-text.js'
import { expandParameterWords } from './expand-parameter-words.js'
import { InputTooLongError } from './input-too-long-error.js'
import { MAX_INPUT_LENGTH } from './max-input-length.js'
import { resolveAssignmentEscapes } from './resolve-assignment-escapes.js'

/**
 * Deepest substitution nesting a command may have. Deeper input is blocked
 * without a full check, so the hook never runs past its timeout and fails
 * open.
 */
const MAX_NESTING = 50

/**
 * Most scan work one top-level call may do, in characters. Each text check
 * (the command itself and each nested command) costs its length times one
 * more than its substitution depth, since the scans of a text re-read each
 * substitution in it. Past this, the command is blocked instead of checked.
 */
const MAX_SCAN_WORK = 200_000

/**
 * Block returned past {@link MAX_NESTING}, {@link MAX_SCAN_WORK} or
 * {@link MAX_INPUT_LENGTH}.
 */
const CANNOT_CHECK: CheckResult = {
  blocked: true,
  reason: `BLOCKED: block-no-verify could not check this command (it is longer than ${String(MAX_INPUT_LENGTH)} characters, or its command substitutions nest more than ${String(MAX_NESTING)} levels deep or hold too much text), so it cannot confirm that git hooks are not bypassed. Rewrite the command shorter or with less nesting.`,
}

/**
 * Returns the escape level of the backtick at `index`: 1 for a bare one, 2
 * for one after one backslash, 3 after three, and so on. Each nesting level
 * of backtick substitutions doubles the backslashes before its backticks.
 * @param text - The command text.
 * @param index - Index of a backtick.
 * @returns The backtick's nesting level.
 */
function backtickLevel(text: string, index: number): number {
  let slashes = 0
  while (text.charAt(index - slashes - 1) === '\\') slashes += 1
  return Math.floor(Math.log2(slashes + 1)) + 1
}

/**
 * Returns how deeply the substitutions in the text nest: the deepest
 * `$(`, `<(` and `>(` nesting, with each `(` inside one counted as a level
 * too, plus the deepest backtick level. Quotes are not tracked, so the count
 * can be too high but never too low. It is one linear pass, so a deep input
 * is blocked before the slower scans run on it.
 * @param text - The command text.
 * @returns The deepest nesting found.
 */
function substitutionDepth(text: string): number {
  let depth = 0
  let deepest = 0
  let backticks = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i)
    if (char === '(' && (depth > 0 || /[$<>]/.test(text.charAt(i - 1)))) {
      depth += 1
      deepest = Math.max(deepest, depth)
    } else if (char === ')' && depth > 0) {
      depth -= 1
    } else if (char === '`') {
      backticks = Math.max(backticks, backtickLevel(text, i))
    }
  }
  return deepest + backticks
}

/** Nested checks in progress for the current top-level call. */
let nesting = 0

/** Results by command text for the current top-level call. */
let checked = new Map<string, CheckResult>()

/** Scan work the current top-level call may still do. */
let budget = MAX_SCAN_WORK

/**
 * Checks one text, charging its scan work to the budget first.
 * @param text - The command text to check.
 * @param depth - The text's substitution depth.
 * @param options - Optional context such as the invoked tool name.
 * @returns CheckResult, or a block when the budget runs out or the text
 *   grows too long to check.
 */
function scan(
  text: string,
  depth: number,
  options: CheckCommandOptions | undefined
): CheckResult {
  budget -= text.length * (depth + 1)
  if (budget < 0) return CANNOT_CHECK
  try {
    return checkCommandText(text, options, checkCommand)
  } catch (error) {
    if (error instanceof InputTooLongError) return CANNOT_CHECK
    // eslint-disable-next-line error/no-throw-literal -- rethrows the caught error unchanged, so run-hook still reports it
    throw error
  }
}

/**
 * Checks one command text as written and, when they differ from it, with
 * each `${NAME:-word}`-style expansion replaced by its word and with
 * escaped assignment values resolved.
 * @param input - The command text to check.
 * @param depth - The text's substitution depth.
 * @param options - Optional context such as the invoked tool name.
 * @returns CheckResult indicating whether the command should be blocked.
 */
function checkVariants(
  input: string,
  depth: number,
  options: CheckCommandOptions | undefined
): CheckResult {
  let result = scan(input, depth, options)
  for (const variant of [
    expandParameterWords(input),
    resolveAssignmentEscapes(input),
  ]) {
    if (result.blocked) return result
    if (variant !== input) result = scan(variant, depth, options)
  }
  return result
}

/**
 * Checks a command input for --no-verify flag usage, hooks path override, a
 * tool-specific override handled by a manager (e.g. HUSKY=0), or a direct
 * GitHub MCP tool invocation that would bypass local git hooks.
 *
 * The text is checked as written first. When it holds a `${NAME:-word}`-style
 * expansion, the text with each such expansion replaced by its word is
 * checked too (see {@link expandParameterWords}). When an assignment value
 * holds backslash escapes, the text with those values resolved is checked
 * too (see {@link resolveAssignmentEscapes}). Any check can block. The
 * variants only add checks, so a command the text check blocks is always
 * blocked, with that check's reason.
 *
 * Nested commands are checked through this function too. Within one
 * top-level call, each command text is checked once, so a substitution
 * nested in many others costs about the same as one. Input that nests
 * deeper than {@link MAX_NESTING}, whose checks would do more than
 * {@link MAX_SCAN_WORK} scan work, or that is longer than
 * {@link MAX_INPUT_LENGTH} characters, is blocked.
 * @param input - The command input to check (typically from stdin in AI agent
 *   hooks). May be an empty string when the invocation is a non-shell tool
 *   call (e.g. an MCP tool).
 * @param options - Optional context such as the invoked tool name.
 * @returns CheckResult indicating whether the command should be blocked.
 */
export function checkCommand(
  input: string,
  options?: CheckCommandOptions
): CheckResult {
  if (nesting === 0) {
    checked = new Map()
    budget = MAX_SCAN_WORK
  }
  if (input.length > MAX_INPUT_LENGTH) return CANNOT_CHECK
  const known = checked.get(input)
  if (known !== undefined) return known
  const depth = substitutionDepth(input)
  if (depth > MAX_NESTING) return CANNOT_CHECK
  nesting += 1
  let result: CheckResult
  try {
    result = checkVariants(input, depth, options)
  } finally {
    nesting -= 1
  }
  checked.set(input, result)
  return result
}
