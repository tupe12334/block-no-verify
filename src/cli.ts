#!/usr/bin/env node
/**
 * block-no-verify CLI
 *
 * Usage in Claude Code hooks:
 *
 * In your .claude/settings.json:
 * ```json
 * {
 *   "hooks": {
 *     "PreToolUse": [
 *       {
 *         "matcher": "Bash",
 *         "hooks": [
 *           {
 *             "type": "command",
 *             "command": "block-no-verify"
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * The CLI reads the command from stdin and exits with:
 * - 0 if the command is allowed
 * - 2 if the command is blocked (contains --no-verify)
 * - 1 if an error occurred
 */

import { checkCommand, EXIT_CODES } from './index.js'

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''

    // Set encoding to utf8
    process.stdin.setEncoding('utf8')

    // Handle data chunks
    process.stdin.on('data', chunk => {
      data += chunk
    })

    // Resolve when stdin ends
    process.stdin.on('end', () => {
      resolve(data)
    })

    // Handle errors
    process.stdin.on('error', err => {
      reject(err)
    })

    // If stdin is empty/not piped, resolve with empty string after a short timeout
    if (process.stdin.isTTY) {
      resolve('')
    }
  })
}

async function main(): Promise<void> {
  try {
    const input = await readStdin()

    if (!input.trim()) {
      // No input provided, allow by default
      process.exit(EXIT_CODES.ALLOWED)
    }

    const result = checkCommand(input)

    if (result.blocked) {
      console.error(result.reason)
      process.exit(EXIT_CODES.BLOCKED)
    }

    process.exit(EXIT_CODES.ALLOWED)
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    )
    process.exit(EXIT_CODES.ERROR)
  }
}

main()
