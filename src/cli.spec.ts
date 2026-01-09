import { spawn } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'

const currentDir = dirname(fileURLToPath(import.meta.url))
const cliPath = resolve(currentDir, '../dist/cli.js')

function runCli(input: string): Promise<{ code: number; stderr: string }> {
  return new Promise(resolvePromise => {
    const child = spawn('node', [cliPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stderr = ''

    child.stderr.on('data', data => {
      stderr += data.toString()
    })

    child.on('close', code => {
      const exitCode = code === null ? 0 : code
      resolvePromise({ code: exitCode, stderr })
    })

    child.stdin.write(input)
    child.stdin.end()
  })
}

describe('CLI', () => {
  describe('blocking commands', () => {
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

  describe('allowing commands', () => {
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
})
