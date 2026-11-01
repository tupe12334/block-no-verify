/** Stands in for the `$` or backtick of a literal (non-running) opener. */
const NEUTRAL = '\u0001'

/** An open quote or substitution. `depth` counts parentheses in a `subst`. */
interface Frame {
  kind: 'single' | 'double' | 'backtick' | 'subst'
  depth: number
}

/**
 * Returns the replacement for a backslash escape pair. An escaped `$` or
 * backtick is literal text, so it is neutralized. Any other pair is copied.
 * @param next - The character after the backslash.
 * @returns The text that replaces the backslash and `next`.
 */
function escapedPair(next: string): string {
  return next === '$' || next === '`' ? `\\${NEUTRAL}` : `\\${next}`
}

/**
 * Replaces the `$` of a `$(` and each backtick that bash reads as literal text
 * with a control character. Bash never runs those: a `$(` or backtick inside
 * single quotes, or one escaped with a backslash, is only text. `shell-quote`
 * drops the quote and escape information, so the text would otherwise look
 * like a live substitution and its inner command would be checked as code.
 *
 * A small scanner tracks quoting and command substitution, so a `$(` that is
 * live (in code, or inside double quotes or another live substitution) is left
 * alone. Only literal openers are rewritten, so the rest of the text is
 * unchanged.
 * @param input - The command string, with ANSI-C quoting already normalized.
 * @returns The command string with literal `$(` and backticks neutralized.
 */
export function neutralizeLiteralSubstitutions(input: string): string {
  // Open constructs, innermost last. An empty stack is top-level code.
  const stack: Frame[] = []
  let result = ''

  for (let i = 0; i < input.length; i++) {
    const char = input.charAt(i)
    const next = input.charAt(i + 1)
    const frame = stack.at(-1)

    if (frame?.kind === 'single') {
      if (char === "'") stack.pop()
      const literal = char === '`' || (char === '$' && next === '(')
      result += literal ? NEUTRAL : char
      continue
    }

    if (frame?.kind === 'double') {
      if (char === '\\' && next !== '') {
        result += escapedPair(next)
        i += 1
        continue
      }
      if (char === '"') stack.pop()
      if (char === '`') stack.push({ kind: 'backtick', depth: 0 })
      if (char === '$' && next === '(') {
        stack.push({ kind: 'subst', depth: 1 })
        result += '$('
        i += 1
        continue
      }
      result += char
      continue
    }

    if (frame?.kind === 'backtick') {
      if (char === '\\' && next !== '') {
        result += `${char}${next}`
        i += 1
        continue
      }
      if (char === '`') stack.pop()
      result += char
      continue
    }

    // Code: top-level, or inside a live `$( … )`.
    if (char === '\\' && next !== '') {
      result += escapedPair(next)
      i += 1
      continue
    }
    if (char === '$' && next === '(') {
      stack.push({ kind: 'subst', depth: 1 })
      result += '$('
      i += 1
      continue
    }
    if (char === "'") stack.push({ kind: 'single', depth: 0 })
    if (char === '"') stack.push({ kind: 'double', depth: 0 })
    if (char === '`') stack.push({ kind: 'backtick', depth: 0 })
    if (frame !== undefined && char === '(') frame.depth += 1
    if (frame !== undefined && char === ')') {
      frame.depth -= 1
      if (frame.depth === 0) stack.pop()
    }
    result += char
  }

  return result
}
