/**
 * Checks if the input contains a -c core.hooksPath= override
 * which is used to bypass git hooks by redirecting the hooks directory
 * @param input - The command string to scan.
 * @returns True when a core.hooksPath override is detected.
 */
export function hasHooksPathOverride(input: string): boolean {
  // Match: -c core.hooksPath=<value> with optional quotes around the value
  // Handles: -c core.hooksPath=/dev/null, -c "core.hooksPath=", -c 'core.hooksPath=/tmp'
  if (/-c\s+["']?core\.hooksPath\s*=/.test(input)) {
    return true
  }

  // Match: GIT_CONFIG_COUNT=N ... GIT_CONFIG_KEY_i=core.hooksPath
  // Git reads config from numbered env var sets: COUNT, KEY_0..N-1, VALUE_0..N-1.
  if (
    /GIT_CONFIG_COUNT=\d/.test(input) &&
    /GIT_CONFIG_KEY_\d+=core\.hooksPath/.test(input)
  ) {
    return true
  }

  // Match: GIT_CONFIG_PARAMETERS containing core.hooksPath
  // Git also reads config from this space-separated list of 'key=value' pairs.
  if (
    input.includes('GIT_CONFIG_PARAMETERS=') &&
    input.includes('core.hooksPath')
  ) {
    return true
  }

  return false
}
