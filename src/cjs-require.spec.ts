/**
 * Proves the CommonJS entry point loads from a plain CommonJS caller.
 * Requires a prior `pnpm build`. Skips automatically when dist/cjs/index.js is absent.
 */
import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { describe, it, expect } from 'vitest'

const cjsEntry = fileURLToPath(new URL('../dist/cjs/index.js', import.meta.url))
// eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed path relative to this spec, never user input
const cjsBuilt = existsSync(cjsEntry)

describe.skipIf(!cjsBuilt)('CommonJS require', () => {
  it('loads checkCommand via require() and blocks --no-verify', () => {
    const script = [
      `const { checkCommand } = require(${JSON.stringify(cjsEntry)});`,
      `console.log(JSON.stringify([checkCommand('git commit --no-verify -m x').blocked, checkCommand('ls -la').blocked]));`,
    ].join('\n')
    const out = spawnSync(process.execPath, ['-e', script], {
      encoding: 'utf8',
    })
    expect(out.stderr).toBe('')
    expect(out.status).toBe(0)
    expect(JSON.parse(out.stdout.trim())).toEqual([true, false])
  })
})
