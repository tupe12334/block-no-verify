import type { CheckResult } from './check-result.js'
import { findMessageValueSpans } from './find-message-value-spans.js'
import { hasHookSkipSignal } from './has-hook-skip-signal.js'
import { hasNoVerifyFlag } from './has-no-verify-flag.js'
import { hasSkipFlagWord } from './has-skip-flag-word.js'
import { InputTooLongError } from './input-too-long-error.js'
import { detectManagerBypass } from './managers/index.js'
import { maskMessageValues } from './mask-message-values.js'
import { resolveAssignmentEscapes } from './resolve-assignment-escapes.js'
import { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'

/** Text that replaces each masked message value, inside its quotes. */
const PLACEHOLDER = 'x'

/**
 * Returns the text with each quoted commit message and PR body (see
 * {@link findMessageValueSpans}) replaced by {@link PLACEHOLDER} in the same
 * quotes, or null when there is no such value.
 * @param text - The command text.
 * @returns The masked copy, or null.
 */
function maskValueText(text: string): string | null {
  const spans = findMessageValueSpans(text)
  if (spans.length === 0) return null
  let masked = ''
  let end = 0
  for (const span of spans) {
    masked += text.slice(end, span.start) + PLACEHOLDER
    end = span.end
  }
  return masked + text.slice(end)
}

/**
 * Returns true when the masked copy has a hook-skip flag or hook-manager
 * env var for any guarded git command. The values that were masked may have
 * been where the full check found the git command, so the flags are checked
 * for each command, not only the one the masked copy names. Any word that
 * is a hook-skip flag counts too (see {@link hasSkipFlagWord}), whatever
 * option comes before it.
 * @param masked - The masked command text. Its escaped assignment values
 *   are also resolved (see `resolveAssignmentEscapes`) and checked.
 * @returns True when a bypass is found for any guarded command.
 */
function hasBypassForAnyCommand(masked: string): boolean {
  return [masked, resolveAssignmentEscapes(masked)].some(text => {
    if (hasSkipFlagWord(text)) return true
    const scanText = maskMessageValues(text)
    return GIT_COMMANDS_WITH_NO_VERIFY.some(
      command =>
        hasNoVerifyFlag(text, command) ||
        detectManagerBypass(scanText, command) !== null
    )
  })
}

/**
 * Checks a command that was too large to check, with each quoted commit
 * message and PR body replaced by a short placeholder. The shell never runs
 * that text, so the masked copy runs the same programs with the same flags.
 * The full check runs on the masked copy, so all text outside the values
 * gets the same check as any small command. The masked copy is allowed only
 * when that check allows it and it has no `--no-verify`-style flag or
 * hook-manager env var for any guarded command.
 *
 * As an extra guard, a command with a hook-skip signal anywhere (see
 * {@link hasHookSkipSignal}) is not masked. A command with no value to mask,
 * or whose masked copy is still too large to check, is not checked either.
 * @param text - The command text that was too large to check.
 * @param check - The full check, with all its variants, run on the masked
 *   copy.
 * @returns The masked copy's result, or null when the command stays
 *   unchecked.
 */
export function checkMaskedMessageValues(
  text: string,
  check: (masked: string) => CheckResult
): CheckResult | null {
  if (hasHookSkipSignal(text)) return null
  const masked = maskValueText(text)
  // A masked copy masks to itself, so this also ends the recursion.
  if (masked === null || masked === text) return null
  try {
    const result = check(masked)
    if (!result.blocked && hasBypassForAnyCommand(masked)) return null
    return result
  } catch (error) {
    if (error instanceof InputTooLongError) return null
    // eslint-disable-next-line error/no-throw-literal -- rethrows the caught error unchanged, so run-hook still reports it
    throw error
  }
}
