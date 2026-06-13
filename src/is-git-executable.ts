/**
 * Whether a token is the `git` executable itself — bare `git`, `git.exe`, or a
 * path ending in either (`/usr/bin/git`, `./git`, `C:\\Git\\git.exe`). Such a
 * token starts a new git invocation, so it also acts as a command boundary when
 * two invocations share a line without an explicit separator (a newline, which
 * `shell-quote` collapses into plain whitespace).
 */
export function isGitExecutable(token: string): boolean {
  const base = token.toLowerCase().split(/[/\\]/).pop()
  return base === 'git' || base === 'git.exe'
}
