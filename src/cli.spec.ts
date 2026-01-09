import { spawn } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'

const currentDir = dirname(fileURLToPath(import.meta.url))
const cliPath = resolve(currentDir, '../dist/cli.js')

function runCli(
  input: string,
  args: string[] = []
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise(resolvePromise => {
    const child = spawn('node', [cliPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', data => {
      stdout += data.toString()
    })

    child.stderr.on('data', data => {
      stderr += data.toString()
    })

    child.on('close', code => {
      const exitCode = code === null ? 0 : code
      resolvePromise({ code: exitCode, stdout, stderr })
    })

    child.stdin.write(input)
    child.stdin.end()
  })
}

function runCliWithArgs(
  args: string[]
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise(resolvePromise => {
    const child = spawn('node', [cliPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', data => {
      stdout += data.toString()
    })

    child.stderr.on('data', data => {
      stderr += data.toString()
    })

    child.on('close', code => {
      const exitCode = code === null ? 0 : code
      resolvePromise({ code: exitCode, stdout, stderr })
    })

    // Close stdin immediately for args-only tests
    child.stdin.end()
  })
}

describe('CLI', () => {
  describe('blocking commands (stdin)', () => {
    it('should exit with code 2 for git commit --no-verify', async () => {
      const result = await runCli('git commit --no-verify -m "test"')
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
    })

    it('should exit with code 2 for git push --no-verify', async () => {
      const result = await runCli('git push --no-verify origin main')
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
    })

    it('should exit with code 2 for git commit -n', async () => {
      const result = await runCli('git commit -n -m "test"')
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
    })
  })

  describe('allowing commands (stdin)', () => {
    it('should exit with code 0 for git commit without --no-verify', async () => {
      const result = await runCli('git commit -m "test"')
      expect(result.code).toBe(0)
    })

    it('should exit with code 0 for git push without --no-verify', async () => {
      const result = await runCli('git push origin main')
      expect(result.code).toBe(0)
    })

    it('should exit with code 0 for non-git commands', async () => {
      const result = await runCli('npm install')
      expect(result.code).toBe(0)
    })

    it('should exit with code 0 for empty input', async () => {
      const result = await runCli('')
      expect(result.code).toBe(0)
    })

    it('should exit with code 0 for git push -n (dry-run)', async () => {
      const result = await runCli('git push -n origin main')
      expect(result.code).toBe(0)
    })
  })

  describe('command line arguments', () => {
    it('should accept command as argument', async () => {
      const result = await runCliWithArgs(['git commit --no-verify -m "test"'])
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
    })

    it('should allow safe commands as argument', async () => {
      const result = await runCliWithArgs(['git commit -m "test"'])
      expect(result.code).toBe(0)
    })

    it('should show help with --help', async () => {
      const result = await runCliWithArgs(['--help'])
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('block-no-verify')
      expect(result.stdout).toContain('USAGE')
      expect(result.stdout).toContain('OPTIONS')
    })

    it('should show help with -h', async () => {
      const result = await runCliWithArgs(['-h'])
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('block-no-verify')
    })

    it('should show version with --version', async () => {
      const result = await runCliWithArgs(['--version'])
      expect(result.code).toBe(0)
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+\n$/)
    })

    it('should show version with -v', async () => {
      const result = await runCliWithArgs(['-v'])
      expect(result.code).toBe(0)
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+\n$/)
    })

    it('should error on unknown option', async () => {
      const result = await runCliWithArgs(['--unknown'])
      expect(result.code).toBe(1)
      expect(result.stderr).toContain('Unknown option')
    })
  })

  describe('--format option', () => {
    it('should parse plain format', async () => {
      const result = await runCliWithArgs([
        '--format',
        'plain',
        'git commit --no-verify',
      ])
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
    })

    it('should parse json format with command field', async () => {
      const input = JSON.stringify({ command: 'git commit --no-verify' })
      const result = await runCli(input, ['--format', 'json'])
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
    })

    it('should parse claude-code format', async () => {
      const input = JSON.stringify({
        tool_input: { command: 'git push --no-verify' },
      })
      const result = await runCli(input, ['--format', 'claude-code'])
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
    })

    it('should auto-detect json format', async () => {
      const input = JSON.stringify({ command: 'git commit --no-verify' })
      const result = await runCli(input, ['--format', 'auto'])
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
    })

    it('should support --format=value syntax', async () => {
      const input = JSON.stringify({ command: 'git commit --no-verify' })
      const result = await runCli(input, ['--format=json'])
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
    })

    it('should error on invalid format', async () => {
      const result = await runCliWithArgs(['--format', 'invalid', 'git commit'])
      expect(result.code).toBe(1)
      expect(result.stderr).toContain('Invalid format')
    })
  })

  describe('JSON input auto-detection', () => {
    it('should auto-detect and extract from Claude Code format', async () => {
      const input = JSON.stringify({
        tool_input: { command: 'git commit --no-verify -m "test"' },
      })
      const result = await runCli(input)
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
    })

    it('should auto-detect and extract from generic json', async () => {
      const input = JSON.stringify({ cmd: 'git merge --no-verify' })
      const result = await runCli(input)
      expect(result.code).toBe(2)
      expect(result.stderr).toContain('BLOCKED')
    })

    it('should allow safe commands in JSON format', async () => {
      const input = JSON.stringify({
        tool_input: { command: 'git commit -m "safe commit"' },
      })
      const result = await runCli(input)
      expect(result.code).toBe(0)
    })

    it('should handle JSON with shell field', async () => {
      const input = JSON.stringify({ shell: 'git rebase --no-verify' })
      const result = await runCli(input)
      expect(result.code).toBe(2)
    })

    it('should handle JSON with script field', async () => {
      const input = JSON.stringify({
        script: 'git cherry-pick --no-verify abc',
      })
      const result = await runCli(input)
      expect(result.code).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle JSON with non-string command (fallback)', async () => {
      const input = JSON.stringify({ command: 123 })
      const result = await runCli(input)
      // Should treat as plain text and allow (no git command detected)
      expect(result.code).toBe(0)
    })

    it('should handle invalid JSON gracefully in plain mode', async () => {
      const result = await runCli('{invalid json', ['--format', 'plain'])
      expect(result.code).toBe(0)
    })

    it('should handle command with format before it', async () => {
      const result = await runCliWithArgs([
        '--format',
        'plain',
        'git commit --no-verify',
      ])
      expect(result.code).toBe(2)
    })

    it('should handle command with format after it', async () => {
      const result = await runCliWithArgs([
        'git commit --no-verify',
        '--format',
        'plain',
      ])
      expect(result.code).toBe(2)
    })
  })
})
