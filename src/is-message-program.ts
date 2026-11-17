/**
 * Returns true when the token names a program whose message options take
 * prose: `git` or `gh`, with an optional path prefix or `.exe` suffix. Other
 * programs can give `-m` another meaning, and GNU `parallel -m "…"` even runs
 * the next word through a shell, so their arguments are never masked.
 * @param token - The statement's program word.
 * @returns True when the program is git or gh.
 */
export function isMessageProgram(token: string): boolean {
  const base = token
    .slice(Math.max(token.lastIndexOf('/'), token.lastIndexOf('\\')) + 1)
    .toLowerCase()
    .replace(/\.exe$/, '')
  return base === 'git' || base === 'gh'
}
