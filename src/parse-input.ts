import { tryExtractFromJson } from './extract-from-json.js'
import type { InputFormat } from './input-format.js'
import type { ParseResult } from './parse-result.js'

interface ResolvedJson {
  command: string
  toolName: string | null
}

function resolveExtracted(input: string): ResolvedJson {
  const extracted = tryExtractFromJson(input)
  if (extracted === null) {
    return { command: input, toolName: null }
  }
  return {
    command: extracted.command === null ? input : extracted.command,
    toolName: extracted.toolName,
  }
}

function buildResult(
  command: string,
  format: InputFormat,
  toolName: string | null
): ParseResult {
  if (toolName === null) {
    return { command, format }
  }
  return { command, format, toolName }
}

function parseAuto(input: string): ParseResult {
  const trimmed = input.trim()

  if (trimmed.startsWith('{')) {
    const extracted = tryExtractFromJson(trimmed)
    if (extracted !== null) {
      return buildResult(
        extracted.command === null ? input : extracted.command,
        'json',
        extracted.toolName
      )
    }
  }

  return buildResult(input, 'plain', null)
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
    const extracted = resolveExtracted(input)
    return buildResult(extracted.command, 'claude-code', extracted.toolName)
  }

  if (resolvedFormat === 'json') {
    const extracted = resolveExtracted(input)
    return buildResult(extracted.command, 'json', extracted.toolName)
  }

  return parseAuto(input)
}
