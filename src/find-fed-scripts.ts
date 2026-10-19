import { tokenizeCommand } from './tokenize-command.js'

/** Shells that run a script read from stdin. */
const SHELLS = new Set(
  // cspell:disable-next-line
  'sh bash zsh dash ksh ash mksh yash posh fish'.split(' ')
)

/** The here-string operator, as a set for an exact lookup. */
const HERE_STRING = new Set(['<<<'])

/** The pipe operator, as a set for an exact lookup. */
const PIPE = new Set(['|'])

/** Programs whose arguments become the text they write to stdout. */
const PRINTERS = new Set(['echo', 'printf'])

/**
 * Returns the program name of a word, without any path prefix.
 * @param word - An argv word.
 * @returns The base name.
 */
function baseName(word: string): string {
  return word.slice(word.lastIndexOf('/') + 1)
}

/**
 * Returns the scripts that the input feeds to a shell on stdin, so the
 * caller can check them like typed commands (#101):
 * - `echo '…' | sh` and `printf '…' | bash`: the printed arguments;
 * - `sh <<< '…'`: the here-string.
 * A printed argument that is only an option or a printf format is checked
 * too, which can only widen the scan.
 * @param input - The raw command string.
 * @returns The fed scripts, in input order.
 */
export function findFedScripts(input: string): string[] {
  const scripts: string[] = []
  let words: string[] = []
  let printed: string[] | null = null
  let hereStringIsNext = false
  for (const token of tokenizeCommand(input)) {
    if (typeof token === 'string') {
      if (hereStringIsNext) {
        scripts.push(token)
        hereStringIsNext = false
      } else if (
        words.length === 0 &&
        printed !== null &&
        SHELLS.has(baseName(token))
      ) {
        scripts.push(printed.join(' '))
      }
      words.push(token)
      continue
    }
    if (!('op' in token)) continue
    if (HERE_STRING.has(token.op)) {
      hereStringIsNext = words.some(word => SHELLS.has(baseName(word)))
      continue
    }
    const program = words.length > 0 ? baseName(words[0]) : ''
    printed =
      PIPE.has(token.op) && PRINTERS.has(program) ? words.slice(1) : null
    words = []
  }
  return scripts
}
