import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { issuesUrl } from './package-info.js'

describe('issuesUrl', () => {
  it('returns the project bug tracker new-issue URL', () => {
    expect(issuesUrl()).toBe(
      'https://github.com/tupe12334/block-no-verify/issues/new'
    )
  })

  it('matches package.json bugs.url', () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed path relative to this spec, never user input
    const raw = readFileSync(
      new URL('../package.json', import.meta.url),
      'utf8'
    )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- package.json shape is asserted by the expect below
    const pkg: { bugs: { url: string } } = JSON.parse(raw)
    expect(issuesUrl()).toBe(`${pkg.bugs.url}/new`)
  })
})
