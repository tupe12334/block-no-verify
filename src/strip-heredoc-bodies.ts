/**
 * Matches a heredoc operator and its delimiter: `<<EOF`, `<<-EOF`, `<<'EOF'`,
 * `<<"EOF"`, `<<\EOF`. A here-string `<<<` is not a heredoc, so the operator
 * must not be followed or preceded by another `<`.
 */
const HEREDOC_START = /(?<!<)<<(-?)\s*([^\s<>|&;()]+)/g

/** Shells that run a heredoc body as their script (when not given `-c`). */
const SHELLS = new Set(
  // cspell:disable-next-line
  'sh bash zsh dash ksh ash mksh yash posh'.split(' ')
)

/** A leading `NAME=value` word on a command line. */
const ASSIGNMENT = /^[A-Za-z_]\w*=/

/**
 * Returns true when a command segment runs a shell that reads its script from
 * the heredoc: a shell with no `-c` option. A shell given `-c` reads its
 * script from the operand, so the heredoc is only that command's stdin.
 * @param segment - The text of one pipeline or list segment before the `<<`.
 * @returns True when the heredoc body is shell code.
 */
function runsHeredocAsShell(segment: string): boolean {
  const words = segment.trim().split(/\s+/)
  const program = words.find(word => !ASSIGNMENT.test(word))
  if (program === undefined) return false
  const base = program.slice(program.lastIndexOf('/') + 1)
  if (!SHELLS.has(base)) return false
  return !words.some(word => /^-[a-zA-Z]*c[a-zA-Z]*$/.test(word))
}

/**
 * Returns true when the heredoc opened by a line is fed to a shell that runs
 * it. The check is conservative: when any segment before the `<<` on the line
 * runs a shell, the body is kept and checked as shell text.
 * @param prefix - The line text before the heredoc operator.
 * @returns True when the body must stay in the checked text.
 */
function feedsShell(prefix: string): boolean {
  return prefix.split(/[|;&]/).some(runsHeredocAsShell)
}

/** A heredoc whose body has not been read yet. */
interface PendingBody {
  delimiter: string
  stripTabs: boolean
  /**
   * What to keep of the body: `all` for a body a shell runs, `expansions` for
   * an unquoted body (only its `$(` and backtick lines can run), `none` for a
   * quoted body, which is plain data.
   */
  keep: 'all' | 'expansions' | 'none'
}

/**
 * Returns true when a body line stays in the checked text.
 * @param keep - What to keep of the body.
 * @param line - The body line.
 * @returns True when the line is kept.
 */
function keepsBodyLine(keep: PendingBody['keep'], line: string): boolean {
  if (keep === 'all') return true
  return keep === 'expansions' && hasLiveExpansion(line)
}

/**
 * Returns true when an unquoted heredoc body line has a `$(` or a backtick
 * that the shell expands. In such a body a backslash escapes the next
 * character, so `\$(` is literal text and is not counted.
 * @param line - A body line.
 * @returns True when the line runs a command substitution.
 */
function hasLiveExpansion(line: string): boolean {
  for (let i = 0; i < line.length; i++) {
    const char = line.charAt(i)
    if (char === '\\') i += 1
    else if (char === '`' || (char === '$' && line.charAt(i + 1) === '(')) {
      return true
    }
  }
  return false
}

/**
 * Matches a line that is only a plain `cat` reading one heredoc, with no pipe,
 * redirect or other command: `cat <<'EOF'`, `cat <<\EOF`.
 */
const PLAIN_CAT_HEREDOC = /^\s*cat\s+<<-?\s*\\?['"]?\w+['"]?\s*$/

/**
 * Chooses what to keep of a heredoc body. A shell that runs it keeps all of it.
 * A quoted body of a plain `cat` is data and is dropped. Any other quoted
 * body is kept, because its consumer may execute it (`cat <<\EOF | bash`,
 * `tee s.sh <<\EOF`). An unquoted body keeps only its substitution lines.
 * @param line - The line that opens the heredoc.
 * @param index - The offset of the heredoc operator in the line.
 * @param quoted - True when the delimiter is quoted or escaped.
 * @returns What to keep of the body.
 */
function keepMode(
  line: string,
  index: number | undefined,
  quoted: boolean
): PendingBody['keep'] {
  if (feedsShell(line.slice(0, index))) return 'all'
  if (!quoted) return 'expansions'
  return PLAIN_CAT_HEREDOC.test(line) ? 'none' : 'all'
}

/**
 * Removes heredoc body lines from a command string before it reaches
 * `shell-quote`. A heredoc body is free-form text terminated by a line that
 * matches the delimiter exactly (ignoring leading tabs for `<<-`). A body fed
 * to a non-shell (`cat <<EOF`, `python3 <<EOF`) is data, so it is removed: an
 * unrelated flag inside it (e.g. a `grep -n` example) is not part of any
 * statement. A body fed to a shell that runs it (`bash <<EOF`, `sh -s <<EOF`)
 * is kept, because the shell runs those lines. Several heredoc bodies on one line
 * are queued in order, and a here-string `<<<` is not a heredoc.
 * @param input - The raw command string.
 * @returns The command string with the bodies of data heredoc bodies removed,
 *   leaving the opening `<<DELIM` and the closing delimiter line intact.
 */
export function stripHeredocBodies(input: string): string {
  const lines = input.split('\n')
  const result: string[] = []
  const queue: PendingBody[] = []

  for (const line of lines) {
    if (queue.length > 0) {
      const head = queue[0]
      const candidate = head.stripTabs ? line.replace(/^\t+/, '') : line
      const isTerminator = candidate === head.delimiter
      if (isTerminator || keepsBodyLine(head.keep, line)) result.push(line)
      if (isTerminator) queue.shift()
      continue
    }

    result.push(line)
    for (const match of line.matchAll(HEREDOC_START)) {
      const word = match[2]
      const quoted = /['"\\]/.test(word)
      queue.push({
        delimiter: word.replace(/\\(.)|['"]/g, '$1'),
        stripTabs: match[1] === '-',
        keep: keepMode(line, match.index, quoted),
      })
    }
  }

  return result.join('\n')
}
