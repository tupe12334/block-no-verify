/**
 * Checks if the input contains a -c core.hooksPath= override
 * which is used to bypass git hooks by redirecting the hooks directory
 */
export function hasHooksPathOverride(input: string): boolean {
  // Match: -c core.hooksPath=<value> with optional quotes around the value
  // Handles: -c core.hooksPath=/dev/null, -c "core.hooksPath=", -c 'core.hooksPath=/tmp'
  return /-c\s+["']?core\.hooksPath\s*=/.test(input)
}
