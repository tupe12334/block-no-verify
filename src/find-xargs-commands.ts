import { quote } from 'shell-quote'

/** xargs options that take the next word as their value. */
const VALUE_OPTIONS = new Set([
  '-a',
  '-d',
  '-E',
  '-L',
  '-n',
  '-P',
  '-s',
  '--arg-file',
  '--delimiter',
  '--eof',
  '--max-args',
  '--max-chars',
  '--max-lines',
  // cspell:disable-next-line
  '--max-procs',
])

/** Matches `-IX` or `-iX`, the attached value of a replace option. */
const SHORT_REPLACE = /^-[Ii](.*)$/

/** Matches `--replace=X`, the attached value of the long replace option. */
const LONG_REPLACE = /^--replace=(.*)$/

/** The replace string `-i` and `--replace` use when none is given. */
const DEFAULT_REPLACE = '{}'

/** What the xargs options say about the command and its input. */
interface XargsOptions {
  /** The replace string, when a replace option is given. */
  replace: string | undefined
  /** True with `-0`, which makes the input one item. */
  nullDelimited: boolean
  /** The command word and its arguments. */
  command: string[]
}

/**
 * Reads a replace option word, or none. `-I` alone is not handled here,
 * because its value is the next word.
 * @param word - A word before the xargs command.
 * @returns The replace string, or null when the word is not a replace option.
 */
function readReplaceOption(word: string): string | null {
  if (word === '--replace') return DEFAULT_REPLACE
  const short = SHORT_REPLACE.exec(word)
  const match = short === null ? LONG_REPLACE.exec(word) : short
  if (match === null) return null
  return match[1] === '' ? DEFAULT_REPLACE : match[1]
}

/**
 * Reads the xargs options before the command, so the command words and the
 * replace string are known. An unknown option word is skipped; the first
 * word that is not an option starts the command.
 * @param args - The words after `xargs`.
 * @returns The parsed options and command.
 */
function parseXargsOptions(args: string[]): XargsOptions {
  const options: XargsOptions = {
    replace: undefined,
    nullDelimited: false,
    command: [],
  }
  let rest = args
  while (rest.length > 0) {
    const [word, value = ''] = rest
    if (word === '-I') {
      options.replace = value
      rest = rest.slice(2)
      continue
    }
    if (VALUE_OPTIONS.has(word)) {
      rest = rest.slice(2)
      continue
    }
    const replace = readReplaceOption(word)
    if (replace === null && !word.startsWith('-')) break
    if (replace !== null) options.replace = replace
    if (word === '-0' || word === '--null') options.nullDelimited = true
    rest = rest.slice(1)
  }
  options.command = rest
  return options
}

/**
 * Returns the commands that xargs runs for piped input, so the caller can
 * check them like typed commands. xargs appends each input item to the
 * command, or puts it in place of the replace string (`-I{}`, `-i`,
 * `--replace`), so `echo '…' | xargs -I{} bash -c '{}'` runs the piped text.
 * - With a replace string, each line is one item, and each command word has
 *   every occurrence of the replace string swapped for it.
 * - With `-0`, the whole input is one item.
 * - Otherwise the input is split on whitespace and appended to the command,
 *   once for all items (a superset of xargs' batches).
 * The words are quoted again with `shell-quote`, so the caller can parse them.
 * @param args - The words after `xargs`: its options and its command.
 * @param input - The text piped into xargs.
 * @returns The command strings xargs would run, in order.
 */
export function findXargsCommands(args: string[], input: string): string[] {
  const { replace, nullDelimited, command } = parseXargsOptions(args)
  if (command.length === 0) return []
  if (replace !== undefined) {
    return input
      .split(/\r?\n/)
      .filter(line => line !== '')
      .map(item => quote(command.map(word => word.split(replace).join(item))))
  }
  const items = nullDelimited
    ? [input.replace(/\n$/, '')]
    : input.split(/\s+/).filter(word => word !== '')
  return [quote([...command, ...items])]
}
