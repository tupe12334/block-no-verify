import type { InputFormat } from './input-format.js'

/**
 * Parsed CLI arguments
 */
export interface CliArgs {
  format: InputFormat
  command: string | null
  showHelp: boolean
  showVersion: boolean
}
