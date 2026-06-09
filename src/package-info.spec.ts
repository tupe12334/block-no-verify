import { describe, it, expect } from 'vitest'
import { issuesUrl } from './package-info.js'
import { MissingBugsUrlError } from './missing-bugs-url-error.js'

describe('issuesUrl', () => {
  it('returns the project bug tracker new-issue URL', () => {
    expect(issuesUrl()).toBe(
      'https://github.com/tupe12334/block-no-verify/issues/new'
    )
  })
})

describe('MissingBugsUrlError', () => {
  it('is an Error with a descriptive message', () => {
    const error = new MissingBugsUrlError()
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('MissingBugsUrlError')
    expect(error.message).toContain('bugs.url')
  })
})
