import { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'
import type { GitCommand } from './git-command.js'

const VALID_BEFORE_GIT = ' \t\n\r;&|$`(<{!"\']/.~\\'

function isInComment(input: string, idx: number): boolean {
  const lineStart = input.lastIndexOf('\n', idx - 1) + 1
  const before = input.slice(lineStart, idx)
  for (let i = 0; i < before.length; i++) {
    if (before.charAt(i) === '#') {
      const prev = i > 0 ? before.charAt(i - 1) : ''
      if (prev !== '$' && prev !== '\\') return true
    }
  }
  return false
}

function findGit(
  input: string,
  start: number
): { idx: number; len: number } | null {
  let pos = start
  while (pos < input.length) {
    const idx = input.indexOf('git', pos)
    if (idx === -1) return null
    const isExe = input.slice(idx + 3, idx + 7).toLowerCase() === '.exe'
    const len = isExe ? 7 : 3
    const after = input[idx + len] || ' '
    if (!/[\s"']/.test(after)) {
      pos = idx + 1
      continue
    }
    const before = idx > 0 ? input[idx - 1] : ' '
    if (VALID_BEFORE_GIT.includes(before)) return { idx, len }
    pos = idx + 1
  }
  return null
}

/**
 * Checks if the input contains a git command
 */
export function detectGitCommand(input: string): GitCommand | null {
  let start = 0
  while (start < input.length) {
    const git = findGit(input, start)
    if (!git) return null
    if (isInComment(input, git.idx)) {
      start = git.idx + git.len
      continue
    }
    for (const cmd of GIT_COMMANDS_WITH_NO_VERIFY) {
      const cmdIdx = input.indexOf(cmd, git.idx + git.len)
      if (cmdIdx === -1) continue
      const before = cmdIdx > 0 ? input[cmdIdx - 1] : ' '
      const after = input[cmdIdx + cmd.length] || ' '
      if (!/\s/.test(before)) continue
      if (!/[\s;&#|>)\]}"']/.test(after) && after !== '') continue
      if (/[;|]/.test(input.slice(git.idx + git.len, cmdIdx))) continue
      if (isInComment(input, cmdIdx)) continue
      return cmd
    }
    start = git.idx + git.len
  }
  return null
}
