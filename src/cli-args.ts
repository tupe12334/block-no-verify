import type { CliArgs } from './cli-args-result.js'
import type { InputFormat } from './input-format.js'

/**
 * Valid format values
 */
const VALID_FORMATS = ['auto', 'plain', 'claude-code', 'json']

/**
 * Check if a value is a valid format
 */
function isValidFormat(value: string): value is InputFormat {
  return VALID_FORMATS.includes(value)
}

/**
 * Get argument at index safely using Array.at()
 */
function getArgAt(args: string[], index: number): string | undefined {
  return args.at(index)
}

/**
 * Parse CLI arguments
 */
export function parseArgs(
  args: string[],
  onError: (message: string) => never
): CliArgs {
  const result: CliArgs = {
    format: 'auto',
    command: null,
    showHelp: false,
    showVersion: false,
  }

  let i = 0
  while (i < args.length) {
    const arg = getArgAt(args, i)

    if (arg === undefined) {
      i++
      continue
    }

    if (arg === '--help' || arg === '-h') {
      result.showHelp = true
      i++
      continue
    }

    if (arg === '--version' || arg === '-v') {
      result.showVersion = true
      i++
      continue
    }

    if (arg === '--format') {
      i++
      const formatArg = getArgAt(args, i)
      if (formatArg === undefined) {
        return onError('Missing format value')
      }
      if (!isValidFormat(formatArg)) {
        return onError(`Invalid format: ${formatArg}`)
      }
      result.format = formatArg
      i++
      continue
    }

    if (arg.startsWith('--format=')) {
      const formatArg = arg.slice('--format='.length)
      if (!isValidFormat(formatArg)) {
        return onError(`Invalid format: ${formatArg}`)
      }
      result.format = formatArg
      i++
      continue
    }

    if (arg.startsWith('-')) {
      return onError(`Unknown option: ${arg}`)
    }

    // Positional argument = command
    result.command = arg
    i++
  }

  return result
}
