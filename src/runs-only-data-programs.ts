import { canMaskMessageValues } from './can-mask-message-values.js'
import { DATA_PROGRAMS } from './data-programs.js'
import { dropRedirectTargets } from './drop-redirect-targets.js'
import { tokenizeCommand } from './tokenize-command.js'

/** Operators that end one command and start the next. */
const CONTROL_OPERATORS = new Set([';', '&&', '||', '|', '|&', '&'])

/**
 * A `$` that starts an expansion, or a backtick, anywhere, even quoted. The
 * tokenizer drops expansions, so `"$_"cat` reads as `cat` (bash: `socat` after
 * `echo so`), and a shell can run quoted text: bash in `printf -v 'a[$(…)]'`,
 * zsh in `${(e):-'$(…)'}`.
 */
const EXPANSION = /\$[\w{(@*#?$!~=^+-]|`/

/** A backslash-newline, which bash removes before it reads `$(` or `$'`. */
const LINE_CONTINUATION = /\\\r?\n/

/** printf options that assign a shell variable: `-v name`, zsh `%n`. */
const PRINTF_ASSIGNMENT = /^-v|%n/

/** A redirection operator (`>`, `>&`, `<<<`), but not `<(` or `>(`. */
const REDIRECTION = /^[^()]*[<>][^()]*$/

/** An xargs option that takes a count as the next word: `-n 1`, `-P 4`. */
const XARGS_COUNT_OPTION = /^-[nLPs]$/

/** An xargs option word that takes no next word: `-n1`, `-P4`, `-0`, `-r`. */
const XARGS_FLAG = /^-(?:[nLPs]\d+|[0rt]+)$/

/**
 * Returns true when xargs runs only a data program. Only the options above
 * may come before the program: another option might take the program word as
 * its value (GNU `--process-slot-var echo`, BSD `-J echo`), and a replace
 * string can rename the program.
 * @param args - The words after `xargs`.
 * @returns True when the program xargs runs is a data program.
 */
function xargsRunsDataProgram(args: string[]): boolean {
  let countIsNext = false
  for (const word of args) {
    if (countIsNext) {
      if (!/^\d+$/.test(word)) return false
      countIsNext = false
    } else if (XARGS_COUNT_OPTION.test(word)) {
      countIsNext = true
    } else if (!XARGS_FLAG.test(word)) {
      return DATA_PROGRAMS.has(word)
    }
  }
  return false
}

/**
 * Returns true when a command's words run only a data program: one named
 * without a path or a prefix, or xargs running one. A printf that assigns a
 * variable is not data: it can set `BASH_CMDS[grep]` or zsh's
 * `functions[grep]`, so a later `grep` runs something else.
 * @param words - The command's words.
 * @returns True when the command only prints or searches text.
 */
function isDataCommand(words: string[]): boolean {
  if (words.length === 0) return true
  const [program, ...args] = words
  if (program === 'xargs') return xargsRunsDataProgram(args)
  if (program === 'printf' && args.some(arg => PRINTF_ASSIGNMENT.test(arg))) {
    return false
  }
  return DATA_PROGRAMS.has(program)
}

/**
 * Returns true when every program in the input only prints or searches text
 * (`echo "git commit -m x" | grep -n x`), so no git can run and a flag in the
 * input belongs to one of those programs. The tokenizer's statements must
 * match the shell's (see `canMaskMessageValues`), and the input must hold no
 * line continuation, expansion, subshell, process substitution or function,
 * whose text or body the shell may run. A glob is kept as a word, so it is
 * never taken for a program name.
 * @param input - The raw command string.
 * @returns True when each command in the input runs a data program.
 */
export function runsOnlyDataPrograms(input: string): boolean {
  if (
    !canMaskMessageValues(input) ||
    LINE_CONTINUATION.test(input) ||
    EXPANSION.test(input)
  ) {
    return false
  }
  let words: string[] = []
  for (const token of dropRedirectTargets(tokenizeCommand(input))) {
    if (typeof token === 'string') {
      words.push(token)
    } else if (!('op' in token)) {
      return false
    } else if (token.op === 'glob') {
      words.push(token.pattern)
    } else if (CONTROL_OPERATORS.has(token.op)) {
      if (!isDataCommand(words)) return false
      words = []
    } else if (!REDIRECTION.test(token.op)) {
      return false
    }
  }
  return isDataCommand(words)
}
