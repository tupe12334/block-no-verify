import type { InputFormat } from './input-format.js'
import type { ParseResult } from './parse-result.js'

/**
 * Attempts to parse input as JSON and extract the command
 */
function tryParseJson(input: string): string | null {
  try {
    const parsed: unknown = JSON.parse(input)

    if (typeof parsed !== 'object' || parsed === null) {
      return null
    }

    // Check for Claude Code format: { tool_input: { command: "..." } }
    if (hasProperty(parsed, 'tool_input')) {
      const toolInput = getProperty(parsed, 'tool_input')
      if (typeof toolInput === 'object' && toolInput !== null) {
        if (hasProperty(toolInput, 'command')) {
          const command = getProperty(toolInput, 'command')
          if (typeof command === 'string') {
            return command
          }
        }
      }
    }

    // Generic JSON formats
    const genericKeys = ['command', 'cmd', 'input', 'shell', 'script']
    for (const key of genericKeys) {
      if (hasProperty(parsed, key)) {
        const value = getProperty(parsed, key)
        if (typeof value === 'string') {
          return value
        }
      }
    }

    // If JSON but no recognized command field, return null
    return null
  } catch {
    // Not valid JSON
    return null
  }
}

/**
 * Type-safe property check
 */
function hasProperty(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

/**
 * Type-safe property access using Object.entries
 */
function getProperty(obj: object, key: string): unknown {
  const entries = Object.entries(obj)
  for (const entry of entries) {
    if (entry[0] === key) {
      return entry[1]
    }
  }
  return undefined
}

/**
 * Parses input in Claude Code format
 */
function parseClaudeCode(input: string): string {
  try {
    const parsed: unknown = JSON.parse(input)
    if (typeof parsed !== 'object' || parsed === null) {
      return input
    }
    if (hasProperty(parsed, 'tool_input')) {
      const toolInput = getProperty(parsed, 'tool_input')
      if (typeof toolInput === 'object' && toolInput !== null) {
        if (hasProperty(toolInput, 'command')) {
          const command = getProperty(toolInput, 'command')
          if (typeof command === 'string') {
            return command
          }
        }
      }
    }
    return input
  } catch {
    // If not valid JSON, treat as plain text
    return input
  }
}

/**
 * Parses input in generic JSON format
 */
function parseJson(input: string): string {
  const command = tryParseJson(input)
  if (command !== null) {
    return command
  }
  return input
}

/**
 * Auto-detects format and parses input
 */
function parseAuto(input: string): ParseResult {
  const trimmed = input.trim()

  // Try JSON first if it looks like JSON
  if (trimmed.startsWith('{')) {
    const command = tryParseJson(trimmed)
    if (command !== null) {
      return { command, format: 'json' }
    }
  }

  // Otherwise treat as plain text
  return { command: input, format: 'plain' }
}

/**
 * Parses input according to the specified format
 *
 * @param input - Raw input string
 * @param format - Input format to use (defaults to 'auto' if not provided)
 * @returns ParseResult with extracted command and detected format
 *
 * @example
 * // Plain text
 * parseInput('git commit --no-verify')
 * // => { command: 'git commit --no-verify', format: 'plain' }
 *
 * @example
 * // Claude Code format
 * parseInput('{"tool_input":{"command":"git commit --no-verify"}}', 'claude-code')
 * // => { command: 'git commit --no-verify', format: 'claude-code' }
 *
 * @example
 * // Auto-detect JSON
 * parseInput('{"command":"git commit --no-verify"}')
 * // => { command: 'git commit --no-verify', format: 'json' }
 */
export function parseInput(input: string, format?: InputFormat): ParseResult {
  const resolvedFormat: InputFormat =
    format === undefined || format === null ? 'auto' : format

  if (resolvedFormat === 'plain') {
    return { command: input, format: 'plain' }
  }

  if (resolvedFormat === 'claude-code') {
    return { command: parseClaudeCode(input), format: 'claude-code' }
  }

  if (resolvedFormat === 'json') {
    return { command: parseJson(input), format: 'json' }
  }

  // resolvedFormat === 'auto'
  return parseAuto(input)
}
