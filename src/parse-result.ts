import type { InputFormat } from './input-format.js'

/**
 * Result of parsing input
 */
export interface ParseResult {
  command: string
  format: InputFormat
}
