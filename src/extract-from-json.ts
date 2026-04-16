import type { ExtractedJson } from './extracted-json.js'
import { getProperty } from './get-property.js'
import { hasProperty } from './json-helpers.js'

/**
 * Extracts a `tool_name` field when present at the top level of the JSON
 * payload (Claude Code / Gemini CLI shape).
 */
function extractToolName(parsed: object): string | null {
  if (!hasProperty(parsed, 'tool_name')) {
    return null
  }
  const value = getProperty(parsed, 'tool_name')
  if (typeof value === 'string') {
    return value
  }
  return null
}

function extractClaudeCodeCommand(
  parsed: object,
  toolName: string | null
): ExtractedJson | null {
  if (!hasProperty(parsed, 'tool_input')) {
    return null
  }
  const toolInput = getProperty(parsed, 'tool_input')
  if (typeof toolInput === 'object' && toolInput !== null) {
    if (hasProperty(toolInput, 'command')) {
      const command = getProperty(toolInput, 'command')
      if (typeof command === 'string') {
        return { command, toolName }
      }
    }
  }
  // tool_input present without a string command (e.g. MCP tool invocation).
  return { command: null, toolName }
}

function extractGenericCommand(
  parsed: object,
  toolName: string | null
): ExtractedJson | null {
  const genericKeys = ['command', 'cmd', 'input', 'shell', 'script']
  for (const key of genericKeys) {
    if (hasProperty(parsed, key)) {
      const value = getProperty(parsed, key)
      if (typeof value === 'string') {
        return { command: value, toolName }
      }
    }
  }
  return null
}

/**
 * Attempts to parse input as JSON and extract the command + tool name.
 */
export function tryExtractFromJson(input: string): ExtractedJson | null {
  try {
    const parsed: unknown = JSON.parse(input)

    if (typeof parsed !== 'object' || parsed === null) {
      return null
    }

    const toolName = extractToolName(parsed)

    const claudeCode = extractClaudeCodeCommand(parsed, toolName)
    if (claudeCode !== null) {
      return claudeCode
    }

    const generic = extractGenericCommand(parsed, toolName)
    if (generic !== null) {
      return generic
    }

    // JSON parsed but no recognized command field. Still surface tool name.
    if (toolName !== null) {
      return { command: null, toolName }
    }

    return null
  } catch {
    return null
  }
}
