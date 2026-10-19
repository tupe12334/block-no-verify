import { codeLiterals } from './code-literals.js'
import { isInterpreter } from './is-interpreter.js'
import { stdinIsCode } from './stdin-is-code.js'
import { tokenizeCommand } from './tokenize-command.js'

/** Shells that run a script read from stdin. */
const SHELLS = new Set(
  // cspell:disable-next-line
  'sh bash zsh dash ksh ash mksh yash posh fish'.split(' ')
)

/** The here-string operator, as a set for an exact lookup. */
const HERE_STRING = new Set(['<<<'])

/** Pipe operators that feed one stage's stdout to the next. */
const PIPES = new Set(['|', '|&'])

/** Programs whose arguments become the text they write to stdout. */
const PRINTERS = new Set(['echo', 'printf'])

/** Programs that pass their stdin through to stdout. */
const PASS_THROUGH = new Set(['cat', 'tee', 'head', 'tail'])

/** Programs that run the next word as a program (`sudo sh`, `env bash`). */
const WRAPPERS = new Set(
  // cspell:disable-next-line
  'sudo doas env command nice nohup time timeout exec'.split(' ')
)

/** Per wrapper, the options that take the next word as their value. */
const WRAPPER_VALUE_OPTIONS = new Map([
  ['sudo', new Set(['-u', '-g', '-C', '-h', '-p', '-U', '--user', '--group'])],
  ['doas', new Set(['-u', '-C'])],
  ['timeout', new Set(['-s', '-k', '--signal', '--kill-after'])],
  ['nice', new Set(['-n', '--adjustment'])],
  ['env', new Set(['-u', '-C', '--unset', '--chdir'])],
])

/**
 * Returns the program name of a word, without any path prefix.
 * @param word - An argv word.
 * @returns The base name.
 */
function baseName(word: string): string {
  return word.slice(word.lastIndexOf('/') + 1)
}

/**
 * Returns the index of the stage's program: its first word that is not a
 * wrapper, a wrapper option or its value (`-u root`, `-s KILL`, `5`), or an
 * env assignment.
 * @param words - The stage's argv words.
 * @returns The index, or -1 when there is no program word.
 */
function programIndex(words: string[]): number {
  let valueOptions: Set<string> | undefined
  let skipNext = false
  for (const [index, word] of words.entries()) {
    if (skipNext) {
      skipNext = false
    } else if (valueOptions?.has(word) === true) {
      skipNext = true
    } else if (WRAPPERS.has(baseName(word))) {
      valueOptions = WRAPPER_VALUE_OPTIONS.get(baseName(word))
    } else if (!/^[-\d]/.test(word) && !/^[A-Za-z_]\w*=/.test(word)) {
      return index
    }
  }
  return -1
}

/**
 * Returns the scripts that the input feeds to a shell on stdin, so the
 * caller can check them like typed commands (#101):
 * - `echo '…' | sh`, `printf '…' | sudo bash`, `echo '…' | tee x | sh`: the
 *   printed arguments, carried through `cat`/`tee`/`head`/`tail` stages;
 * - `sh <<< '…'` and `cat <<< '…' | sh`: the here-string;
 * - the same fed to python/perl/ruby/node: the code's string literals.
 * A printed argument that is only an option or a printf format is checked
 * too, which can only widen the scan.
 * @param input - The raw command string.
 * @returns The fed scripts, in input order.
 */
export function findFedScripts(input: string): string[] {
  const scripts: string[] = []
  let words: string[] = []
  let fed: string[] | null = null
  let hereString: string[] | null = null
  let hereStringIsNext = false
  // Ends a pipeline stage; returns what the stage writes to stdout.
  const endStage = (): string[] | null => {
    const index = programIndex(words)
    const program = index === -1 ? '' : baseName(words.slice(index)[0])
    const stdin = hereString !== null ? hereString : fed
    if (stdin !== null && SHELLS.has(program)) scripts.push(stdin.join(' '))
    // Code fed to an interpreter runs git from its string literals; with a
    // script or code option, stdin is only data.
    // The here-string word is the code itself, not a script operand.
    const args = words.slice(index + 1).filter(word => word !== hereString?.[0])
    if (stdin !== null && isInterpreter(program) && stdinIsCode(args)) {
      scripts.push(...codeLiterals(stdin.join(' '), program))
    }
    words = words.slice(index + 1)
    hereString = null
    if (PRINTERS.has(program)) return words
    return PASS_THROUGH.has(program) ? stdin : null
  }
  for (const token of tokenizeCommand(input)) {
    if (typeof token === 'string') {
      if (hereStringIsNext) hereString = [token]
      hereStringIsNext = false
      words.push(token)
    } else if ('op' in token && HERE_STRING.has(token.op)) {
      hereStringIsNext = true
    } else if ('op' in token) {
      const output = endStage()
      fed = PIPES.has(token.op) ? output : null
      words = []
    }
  }
  endStage()
  return scripts
}
