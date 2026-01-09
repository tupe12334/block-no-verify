import { describe, expect, it } from 'vitest'
import { parseArgs } from './cli-args.js'

function createErrorHandler(): (message: string) => never {
  return (message: string): never => {
    throw new Error(message)
  }
}

describe('parseArgs', () => {
  describe('help flag', () => {
    it('should parse --help', () => {
      const onError = createErrorHandler()
      const result = parseArgs(['--help'], onError)
      expect(result.showHelp).toBe(true)
    })

    it('should parse -h', () => {
      const onError = createErrorHandler()
      const result = parseArgs(['-h'], onError)
      expect(result.showHelp).toBe(true)
    })
  })

  describe('version flag', () => {
    it('should parse --version', () => {
      const onError = createErrorHandler()
      const result = parseArgs(['--version'], onError)
      expect(result.showVersion).toBe(true)
    })

    it('should parse -v', () => {
      const onError = createErrorHandler()
      const result = parseArgs(['-v'], onError)
      expect(result.showVersion).toBe(true)
    })
  })

  describe('format option', () => {
    it('should parse --format auto', () => {
      const onError = createErrorHandler()
      const result = parseArgs(['--format', 'auto'], onError)
      expect(result.format).toBe('auto')
    })

    it('should parse --format plain', () => {
      const onError = createErrorHandler()
      const result = parseArgs(['--format', 'plain'], onError)
      expect(result.format).toBe('plain')
    })

    it('should parse --format claude-code', () => {
      const onError = createErrorHandler()
      const result = parseArgs(['--format', 'claude-code'], onError)
      expect(result.format).toBe('claude-code')
    })

    it('should parse --format json', () => {
      const onError = createErrorHandler()
      const result = parseArgs(['--format', 'json'], onError)
      expect(result.format).toBe('json')
    })

    it('should parse --format=value syntax', () => {
      const onError = createErrorHandler()
      const result = parseArgs(['--format=json'], onError)
      expect(result.format).toBe('json')
    })

    it('should error on invalid format', () => {
      const onError = createErrorHandler()
      expect(() => parseArgs(['--format', 'invalid'], onError)).toThrow(
        'Invalid format'
      )
    })

    it('should error on missing format value', () => {
      const onError = createErrorHandler()
      expect(() => parseArgs(['--format'], onError)).toThrow(
        'Missing format value'
      )
    })
  })

  describe('command argument', () => {
    it('should parse positional command', () => {
      const onError = createErrorHandler()
      const result = parseArgs(['git commit --no-verify'], onError)
      expect(result.command).toBe('git commit --no-verify')
    })

    it('should parse command with format option before', () => {
      const onError = createErrorHandler()
      const result = parseArgs(
        ['--format', 'plain', 'git commit --no-verify'],
        onError
      )
      expect(result.format).toBe('plain')
      expect(result.command).toBe('git commit --no-verify')
    })

    it('should parse command with format option after', () => {
      const onError = createErrorHandler()
      const result = parseArgs(
        ['git commit --no-verify', '--format', 'plain'],
        onError
      )
      expect(result.format).toBe('plain')
      expect(result.command).toBe('git commit --no-verify')
    })
  })

  describe('unknown options', () => {
    it('should error on unknown option', () => {
      const onError = createErrorHandler()
      expect(() => parseArgs(['--unknown'], onError)).toThrow('Unknown option')
    })

    it('should error on unknown short option', () => {
      const onError = createErrorHandler()
      expect(() => parseArgs(['-x'], onError)).toThrow('Unknown option')
    })
  })

  describe('defaults', () => {
    it('should default format to auto', () => {
      const onError = createErrorHandler()
      const result = parseArgs([], onError)
      expect(result.format).toBe('auto')
    })

    it('should default command to null', () => {
      const onError = createErrorHandler()
      const result = parseArgs([], onError)
      expect(result.command).toBe(null)
    })

    it('should default showHelp to false', () => {
      const onError = createErrorHandler()
      const result = parseArgs([], onError)
      expect(result.showHelp).toBe(false)
    })

    it('should default showVersion to false', () => {
      const onError = createErrorHandler()
      const result = parseArgs([], onError)
      expect(result.showVersion).toBe(false)
    })
  })
})
