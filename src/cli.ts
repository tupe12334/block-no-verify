#!/usr/bin/env node
/**
 * block-no-verify CLI
 *
 * A platform-agnostic tool to block --no-verify flags in git commands.
 * Works with Claude Code, Gemini CLI, Cursor, and other AI coding tools.
 */

import { parseArgs } from './cli-args.js'
import { HELP_TEXT } from './cli-help.js'
import { parseInput } from './parse-input.js'
import { checkCommand, EXIT_CODES } from './index.js'

const VERSION = '1.1.0'

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''

    process.stdin.setEncoding('utf8')

    process.stdin.on('data', chunk => {
      data += chunk
    })

    process.stdin.on('end', () => {
      resolve(data)
    })

    process.stdin.on('error', err => {
      reject(err)
    })

    if (process.stdin.isTTY) {
      resolve('')
    }
  })
}

function handleError(message: string): never {
  console.error(message)
  console.error('Valid formats: auto, plain, claude-code, json')
  console.error('Use --help for usage information')
  process.exit(EXIT_CODES.ERROR)
}

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv.slice(2), handleError)

    if (args.showHelp) {
      console.log(HELP_TEXT)
      process.exit(EXIT_CODES.ALLOWED)
    }

    if (args.showVersion) {
      console.log(VERSION)
      process.exit(EXIT_CODES.ALLOWED)
    }

    // Get input from argument or stdin
    let rawInput: string
    if (args.command !== null) {
      rawInput = args.command
    } else {
      rawInput = await readStdin()
    }

    if (!rawInput.trim()) {
      process.exit(EXIT_CODES.ALLOWED)
    }

    const { command } = parseInput(rawInput, args.format)
    const result = checkCommand(command)

    if (result.blocked) {
      console.error(result.reason)
      process.exit(EXIT_CODES.BLOCKED)
    }

    process.exit(EXIT_CODES.ALLOWED)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error:', message)
    process.exit(EXIT_CODES.ERROR)
  }
}

main()
