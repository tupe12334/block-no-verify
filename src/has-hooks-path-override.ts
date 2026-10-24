/** The config key that redirects the hooks directory, lowercased. */
const HOOKS_PATH_KEY = 'core.hookspath'

/**
 * Strips surrounding quotes from a whitespace-split word, so a word taken from
 * a quoted blob (`"git`, `/tmp"`) compares as its bare text.
 * @param word - One whitespace-separated word.
 * @returns The word without a leading or trailing quote.
 */
function unquote(word: string): string {
  return word.replace(/^["']+/, '').replace(/["']+$/, '')
}

/**
 * Checks for the space-separated `config [options] core.hooksPath <value>`
 * form, requiring the key to follow the `config` word with only option words
 * between them.
 *
 * Scanning for the word `config` and the key independently matched any command
 * that merely mentioned both somewhere, so `echo 'core.hooksPath via -c and git
 * config'` was blocked although it sets nothing (#130).
 *
 * Words are compared instead of matched with one regex: the option run needs a
 * repeated group, and nesting quantifiers that way is a backtracking risk on
 * attacker-supplied input.
 * @param input - The command string to scan.
 * @returns True when a `config` call sets core.hooksPath to a value.
 */
function setsHooksPathViaConfig(input: string): boolean {
  const words = input
    .split(/\s+/)
    .map(unquote)
    .filter(word => word.length > 0)
  return words.some((word, index) => {
    if (word.toLowerCase() !== 'config') return false
    const rest = words.slice(index + 1)
    const keyIndex = rest.findIndex(candidate => !candidate.startsWith('-'))
    if (keyIndex === -1) return false
    const [key, ...afterKey] = rest.slice(keyIndex)
    if (key.toLowerCase() !== HOOKS_PATH_KEY) return false
    // A bare read sets nothing, and a following statement is not a value.
    if (afterKey.length === 0) return false
    return !/^[;|&]/.test(afterKey[0])
  })
}

/**
 * Checks if the input contains a -c core.hooksPath= override
 * which is used to bypass git hooks by redirecting the hooks directory.
 * Git config section and key names are case-insensitive, so every match is
 * too: `core.hookspath` and `CORE.HOOKSPATH` redirect hooks the same way (#91).
 * @param input - The command string to scan.
 * @returns True when a core.hooksPath override is detected.
 */
export function hasHooksPathOverride(input: string): boolean {
  // Match: -c core.hooksPath=<value> with optional quotes around the value
  // Handles: -c core.hooksPath=/dev/null, -c "core.hooksPath=", -c 'core.hooksPath=/tmp'
  if (/-c\s+["']?core\.hookspath\s*=/i.test(input)) {
    return true
  }

  // Match: GIT_CONFIG_COUNT=N ... GIT_CONFIG_KEY_i=core.hooksPath
  // Git reads config from numbered env var sets: COUNT, KEY_0..N-1, VALUE_0..N-1.
  if (
    /GIT_CONFIG_COUNT=\d/.test(input) &&
    /GIT_CONFIG_KEY_\d+=core\.hookspath/i.test(input)
  ) {
    return true
  }

  // Match: GIT_CONFIG_PARAMETERS containing core.hooksPath
  // Git also reads config from this space-separated list of 'key=value' pairs.
  if (
    input.includes('GIT_CONFIG_PARAMETERS=') &&
    /core\.hookspath/i.test(input)
  ) {
    return true
  }

  // Match: git config [--global|--local|--system|--worktree] core.hooksPath <value>
  // This persistently rewrites the repo (or global) hooks path rather than
  // overriding it for a single invocation, so it must be blocked even when a
  // value is set with a space instead of `=`. A bare read (no value, e.g.
  // `git config core.hooksPath` or `--get`/`--unset`) is intentionally not
  // matched since it does not redirect hooks.
  // An explicit assignment to the key sets it wherever it appears, so it needs
  // no adjacent `config` word to be a bypass. The value must follow `=`
  // directly: `core.hooksPath= issue` is prose, not an assignment.
  if (/core\.hookspath=[^\s"';|&]/i.test(input)) {
    return true
  }

  return setsHooksPathViaConfig(input)
}
