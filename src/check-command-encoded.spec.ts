import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

const encode = (text: string): string =>
  Buffer.from(text, 'utf16le').toString('base64')

// pwsh runs base64 UTF-16LE text given to -EncodedCommand (#101).
describe('checkCommand: pwsh -EncodedCommand', () => {
  it.each([
    `pwsh -EncodedCommand ${encode('git commit --no-verify -m x')}`,
    `pwsh -NoProfile -enc ${encode('git push --no-verify')}`,
    `powershell.exe -e ${encode('git commit -n -m x')}`,
  ])('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it('allows a benign encoded command', () => {
    expect(
      checkCommand(`pwsh -EncodedCommand ${encode('git status')}`).blocked
    ).toBe(false)
  })
})
