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
    'pwsh --enc',
    'pwsh --EncodedCommand',
    'pwsh \u2013enc',
    'pwsh \u2014ec',
    'pwsh \u2015e',
    "pwsh ' -enc'",
    "pwsh '\u0085-enc'",
    "'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe' -e",
    '"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -e',
    'pwsh-preview -e',
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
    `pwsh -- ${encode('git status')}`,
    `pwsh -ea Stop ${encode('git status')}`,
  ])('finds nothing in %s', input => {
    expect(findEncodedCommands(input)).toEqual([])
  })
})
