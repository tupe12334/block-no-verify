import { hasEnvOverrideThatRuns } from './hooks-path-env-scope.js'

/**
 * Checks if the input contains a -c core.hooksPath= override
 * which is used to bypass git hooks by redirecting the hooks directory.
 * Git config section and key names are case-insensitive, so every match is
 * too: `core.hookspath` and `CORE.HOOKSPATH` redirect hooks the same way (#91).
 * An environment override is a bypass only when it reaches a git command that
 * runs hooks (see {@link hasEnvOverrideThatRuns}), so a status check or an
 * echo of the text is allowed.
 * @param input - The command string to scan.
 * @returns True when a core.hooksPath override is detected.
 */
export function hasHooksPathOverride(input: string): boolean {
  // Match: -c core.hooksPath=<value> with optional quotes around the value
  // Handles: -c core.hooksPath=/dev/null, -c "core.hooksPath=", -c 'core.hooksPath=/tmp'
  if (/-c\s+["']?core\.hookspath\s*=/i.test(input)) {
    return true
  }

  // Match: git config [--global|--local|--system|--worktree] core.hooksPath <value>
  // This persistently rewrites the repo (or global) hooks path rather than
  // overriding it for a single invocation, so it must be blocked even when a
  // value is set with a space instead of `=`. A bare read (no value, e.g.
  // `git config core.hooksPath` or `--get`/`--unset`) is intentionally not
  // matched since it does not redirect hooks. `config` must be a whole word,
  // so `--config-env=core.hooksPath=…` is not a config write.
  if (
    /(?<![-\w])config(?![-\w])/.test(input) &&
    /core\.hookspath\s*[= ]\s*\S/i.test(input)
  ) {
    return true
  }

  return hasEnvOverrideThatRuns(input)
}
