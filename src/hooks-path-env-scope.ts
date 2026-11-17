// cspell:ignore allexport shopt
import { DATA_PROGRAMS } from './data-programs.js'
import { detectGitCommand } from './detect-git-command.js'
import { extractNestedStatements } from './extract-nested-statements.js'
import { splitStatements } from './split-statements.js'
import { tokenizeCommand } from './tokenize-command.js'

/** A leading `NAME=value` or `NAME+=value` word. */
const ASSIGNMENT = /^[A-Za-z_]\w*\+?=/

/**
 * Returns true when a statement only prints, copies or searches its words, so
 * an override written in those words is text, not a setting.
 * @param words - The statement's argv words.
 * @returns True when the statement is data.
 */
function isDataStatement(words: string[]): boolean {
  const head = words.find(word => !ASSIGNMENT.test(word))
  if (head === undefined) return true
  return DATA_PROGRAMS.has(head.slice(head.lastIndexOf('/') + 1))
}

/** Git subcommands that run no hooks, so a git call with one cannot run them. */
const NON_HOOK_SUBCOMMANDS = new Set([
  'status',
  'log',
  'diff',
  'show',
  'rev-parse',
  'ls-files',
  'branch',
  'config',
])

/** Builtins that keep an assignment or a definition for later commands. */
const PERSIST_PROGRAMS = new Set([
  'export',
  'declare',
  'typeset',
  'readonly',
  'local',
  'set',
  'alias',
  'eval',
  'source',
  '.',
])

/**
 * Words that keep a value set by `NAME=value` for later commands, define a
 * function or alias that could run the command later, or change shell options
 * (`set -o allexport` exports every assignment). Any of them with an override
 * and a hook-running git command blocks.
 */
const PERSISTS =
  /\b(?:export|declare|typeset|readonly|local|eval|source|set|alias|function|trap|shopt|allexport)\b|(?:^|[;&|\s])\.\s/

/**
 * Returns true when the text sets a git config override of core.hooksPath
 * through the environment or `--config-env`: GIT_CONFIG_COUNT with a
 * GIT_CONFIG_KEY_i naming core.hooksPath, GIT_CONFIG_PARAMETERS with a
 * core.hooksPath entry, or `--config-env[=| ]core.hooksPath=…`. A count of 0
 * sets no entries, so it is not an override. Leading zeros do not change a
 * count, so `0001` is one.
 * @param text - Command text: a whole command or one statement.
 * @returns True when such an override is present.
 */
function hasEnvOverride(text: string): boolean {
  if (
    /GIT_CONFIG_COUNT=0*[1-9]/.test(text) &&
    /GIT_CONFIG_KEY_\d+=core\.hookspath/i.test(text)
  ) {
    return true
  }
  if (/--config-env[= ]core\.hookspath/i.test(text)) return true
  // An entry starts after the start, a space, a quote, or the `=` that the
  // shell tokenizer leaves when it drops the quotes around a value. This also
  // matches `color.ui=core.hooksPath=…`, which git reads as a different key: a
  // known false positive, kept because the match can only block more.
  return text
    .split('GIT_CONFIG_PARAMETERS=')
    .slice(1)
    .some(rest => /(?:^|[\s'"=])'?core\.hookspath/i.test(rest))
}

/**
 * Returns true when a statement's words set an override: a `core.hooksPath`
 * entry, or a git config variable set to a value that is not known here
 * (`GIT_CONFIG_PARAMETERS+=…` appends, and `$` or a backtick expands at run
 * time).
 * @param words - The statement's argv words.
 * @returns True when the words may set a git config override.
 */
function setsOverride(words: string[]): boolean {
  return (
    hasEnvOverride(words.join(' ')) ||
    words.some(word => /^GIT_CONFIG_\w+\+?=/.test(word))
  )
}

/**
 * Returns the program of a statement: its first word that is not an
 * assignment.
 * @param words - The statement's argv words.
 * @returns The program word, or undefined for an assignment-only statement.
 */
function programOf(words: string[]): string | undefined {
  return words.find(word => !ASSIGNMENT.test(word))
}

/**
 * Returns true when a text runs a git command that runs hooks. The check is
 * case-insensitive, because `GIT.exe` names git on Windows.
 * @param text - A command, statement or whole input.
 * @returns True when a guarded git sub-command is found.
 */
function runsHookGit(text: string): boolean {
  return detectGitCommand(text.toLowerCase()) !== null
}

/**
 * Returns true when an environment override of core.hooksPath may reach a git
 * command that runs hooks. An override is allowed only where it provably
 * cannot reach a hook run, and the rules are strict:
 * - With no hook-running git command anywhere in the input, nothing can be
 *   bypassed, so the override is allowed.
 * - An override on a data statement (`echo`, `printf`, …) is text.
 * - An override on `git` with a subcommand that runs no hooks (`git status`) is
 *   allowed.
 * - Any other override statement blocks, including a plain `NAME=value` (its
 *   scope is not modelled, and a function, alias, `env`, `xargs`, `exec` or
 *   wrapper can carry it to git).
 * - A persistent setting (`export`, `set -o allexport`, `eval`, a function, …)
 *   with an override in the input blocks.
 * @param input - The raw command string.
 * @returns True when an override may reach a hook-running git command.
 */
export function hasEnvOverrideThatRuns(input: string): boolean {
  const tokens = tokenizeCommand(input)
  const statements = [
    ...splitStatements(tokens),
    ...extractNestedStatements(tokens),
  ]
  // A git subcommand can arrive on stdin (`xargs git`), so any git word in a
  // command that is not data counts as a possible hook run.
  const hookPossible =
    runsHookGit(input) ||
    statements.some(
      words =>
        !isDataStatement(words) &&
        words.some(w => w.slice(w.lastIndexOf('/') + 1) === 'git') &&
        !words.some(w => NON_HOOK_SUBCOMMANDS.has(w))
    )
  for (const words of statements) {
    if (!setsOverride(words)) continue
    const program = programOf(words)
    if (program === undefined) {
      if (hookPossible) return true
      continue
    }
    if (isDataStatement(words)) continue
    // A persistent builtin keeps the override for later commands, so it counts
    // only when a hook run is possible.
    if (PERSIST_PROGRAMS.has(program)) {
      if (hookPossible) return true
      continue
    }
    const isGit = program.slice(program.lastIndexOf('/') + 1) === 'git'
    if (isGit && !runsHookGit(words.join(' '))) continue
    return true
  }
  return hookPossible && PERSISTS.test(input) && setsOverride([input])
}
