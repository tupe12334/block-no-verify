import type { CheckCommandOptions } from './check-command-options.js'
import type { CheckResult } from './check-result.js'
import { checkCommandText } from './check-command-text.js'
import { expandParameterWords } from './expand-parameter-words.js'

/**
 * Deepest substitution nesting a command may have. Deeper input is blocked
 * without a full check, so the hook never runs past its timeout and fails
 * open.
 */
const MAX_NESTING = 50

/**
 * Most text, in characters, that the nested checks of one command may read.
 * Each nesting level checks its body again, so a long body nested many
 * levels deep is blocked instead of checked level by level.
 */
const MAX_NESTED_TEXT = 100_000

/** Block returned past {@link MAX_NESTING} or {@link MAX_NESTED_TEXT}. */
const TOO_DEEP: CheckResult = {
  blocked: true,
  reason: `BLOCKED: block-no-verify could not check this command (its command substitutions nest more than ${String(MAX_NESTING)} levels deep or hold too much text), so it cannot confirm that git hooks are not bypassed. Rewrite the command with less nesting.`,
}

/**
 * Returns how deeply the `$(`, `<(` and `>(` substitutions in the text nest,
 * with each `(` inside one counted as a level too. Quotes are not tracked, so
 * the count can be too high but never too low. It is one linear pass, so a
 * deep input is blocked before the slower scans run on it.
 * @param text - The command text.
 * @returns The deepest nesting found.
 */
function substitutionDepth(text: string): number {
  let depth = 0
  let deepest = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i)
    if (char === '(' && (depth > 0 || /[$<>]/.test(text.charAt(i - 1)))) {
      depth += 1
      deepest = Math.max(deepest, depth)
    } else if (char === ')' && depth > 0) {
      depth -= 1
    }
  }
  return deepest
}

/** Nested checks in progress for the current top-level call. */
let nesting = 0

/** Results by command text for the current top-level call. */
let checked = new Map<string, CheckResult>()

/** Text the nested checks of the current top-level call may still read. */
let budget = MAX_NESTED_TEXT

/**
 * Checks one command text as written and, when it holds a
 * `${NAME:-word}`-style expansion, with each such expansion replaced by its
 * word.
 * @param input - The command text to check.
 * @param options - Optional context such as the invoked tool name.
 * @returns CheckResult indicating whether the command should be blocked.
 */
function checkVariants(
  input: string,
  options: CheckCommandOptions | undefined
): CheckResult {
  const result = checkCommandText(input, options, checkCommand)
  if (result.blocked) return result
  const variant = expandParameterWords(input)
  return variant === input
    ? result
    : checkCommandText(variant, options, checkCommand)
}

/**
 * Checks a command input for --no-verify flag usage, hooks path override, a
 * tool-specific override handled by a manager (e.g. HUSKY=0), or a direct
 * GitHub MCP tool invocation that would bypass local git hooks.
 *
 * The text is checked as written first. When it holds a `${NAME:-word}`-style
 * expansion, the text with each such expansion replaced by its word is
 * checked too (see {@link expandParameterWords}), and either check can block.
 * The variant only adds a check, so a command the text check blocks is
 * always blocked, with that check's reason.
 *
 * Nested commands are checked through this function too. Within one
 * top-level call, each command text is checked once, so a substitution
 * nested in many others costs about the same as one. Input that nests
 * deeper than {@link MAX_NESTING}, or whose nested checks would read more
 * than {@link MAX_NESTED_TEXT} characters, is blocked.
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
    budget = MAX_NESTED_TEXT
  }
  const known = checked.get(input)
  if (known !== undefined) return known
  if (nesting > 0) budget -= input.length
  if (budget < 0 || substitutionDepth(input) > MAX_NESTING) return TOO_DEEP
  nesting += 1
  let result: CheckResult
  try {
    result = checkVariants(input, options)
  } finally {
    nesting -= 1
  }
  checked.set(input, result)
  return result
}
