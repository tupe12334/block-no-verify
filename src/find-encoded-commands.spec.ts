import { describe, it, expect } from 'vitest'
import { findEncodedCommands } from './find-encoded-commands.js'

const encode = (text: string): string =>
  Buffer.from(text, 'utf16le').toString('base64')

describe('findEncodedCommands', () => {
  it.each([
    'pwsh -EncodedCommand',
    'pwsh -e',
    'pwsh -enc',
    'pwsh -ec',
    'powershell.exe -NoProfile -encodedcommand',
    '/usr/local/bin/pwsh /enc',
  ])('decodes %s', prefix => {
    expect(findEncodedCommands(`${prefix} ${encode('git status')}`)).toEqual([
      'git status',
    ])
  })

  it.each([
    `pwsh -Command ${encode('git status')}`,
    `echo -e ${encode('git status')}`,
    `pwsh -ExecutionPolicy Bypass -File x.ps1`,
    `pwsh -e`,
  ])('finds nothing in %s', input => {
    expect(findEncodedCommands(input)).toEqual([])
  })
})
