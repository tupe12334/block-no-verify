import { GIT_COMMANDS_WITH_NO_VERIFY } from './types.js'
import type { GitCommand } from './git-command.js'

/**
 * Checks if the input contains a git command
 */
export function detectGitCommand(input: string): GitCommand | null {
  for (const cmd of GIT_COMMANDS_WITH_NO_VERIFY) {
    // Match patterns like: git commit, git -C /path commit
    // Using string concatenation and simple includes/match to avoid non-literal RegExp
    const gitIndex = input.indexOf('git')
    if (gitIndex === -1) continue

    const cmdIndex = input.indexOf(cmd, gitIndex)
    if (cmdIndex === -1) continue

    // Verify 'git' is a word boundary (not part of another word)
    const beforeGit = gitIndex > 0 ? input[gitIndex - 1] : ' '
    const afterGit = input[gitIndex + 3] || ' '

    // Allow shell syntax characters before 'git': whitespace, ;, &, |, $(, `, (, <
    const validBeforeGit =
      /\s/.test(beforeGit) ||
      beforeGit === ';' ||
      beforeGit === '&' ||
      beforeGit === '|' ||
      beforeGit === '$' ||
      beforeGit === '`' ||
      beforeGit === '(' ||
      beforeGit === '<' ||
      beforeGit === '{'
    if (!validBeforeGit) {
      continue
    }
    if (!/\s/.test(afterGit)) continue

    // Verify the command is a word boundary
    const beforeCmd = cmdIndex > 0 ? input[cmdIndex - 1] : ' '
    const afterCmd = input[cmdIndex + cmd.length] || ' '

    if (!/\s/.test(beforeCmd)) continue
    if (!/\s|$/.test(afterCmd) && afterCmd !== ';' && afterCmd !== '&') {
      continue
    }

    // Make sure there's no pipe or semicolon between git and cmd that would indicate separate commands
    const between = input.slice(gitIndex + 3, cmdIndex)
    if (/[;|]/.test(between)) continue

    return cmd
  }
  return null
}
