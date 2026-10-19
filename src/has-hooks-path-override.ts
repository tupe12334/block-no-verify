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
  if (/\bconfig\b/.test(input) && /core\.hookspath\s*[= ]\s*\S/i.test(input)) {
    return true
  }

  return false
}
