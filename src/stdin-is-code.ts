/** Options that give the code another way, so stdin is only data. */
// cspell:disable-next-line
const CODE_OPTION = /^-[A-Za-z]*[cemnpE]/

/** Long options that give the code (`node --eval`). */
const LONG_CODE_OPTION = /^--(?:eval|print|module)\b/

/** Options whose value is the next word (`python3 -W ignore`, `node -r x`). */
const VALUE_OPTIONS = new Set(['-W', '-X', '-r', '--require'])

/** deno and bun take `run` before the script operand. */
const RUN = new Set(['run'])

/**
 * Tells whether an interpreter reads its code from stdin, given the words
 * after its name. A script operand (`python3 x.py`) or a code option
 * (`-c`, `-e`, `-m`, `-n`, `-p`) makes stdin input data instead; `-` and
 * plain flags (`-u`, `-I`) keep stdin as the code.
 * @param args - The words after the interpreter name.
 * @returns True when stdin is the code.
 */
export function stdinIsCode(args: string[]): boolean {
  let skipValue = false
  for (const arg of args) {
    if (skipValue) {
      skipValue = false
      continue
    }
    if (VALUE_OPTIONS.has(arg)) skipValue = true
    else if (arg === '-') return true
    else if (CODE_OPTION.test(arg) || LONG_CODE_OPTION.test(arg)) return false
    else if (!arg.startsWith('-') && !RUN.has(arg)) return false
  }
  return true
}
