import { describe, it, expect } from 'vitest'
import { findVariableNameCode } from './find-variable-name-code.js'

describe('findVariableNameCode', () => {
  it('returns a printf -v subscript target', () => {
    expect(findVariableNameCode(`printf -v 'a[$(id)]' x`)).toEqual(['a[$(id)]'])
  })

  it('ignores a plain printf -v name', () => {
    expect(findVariableNameCode('printf -v a x')).toEqual([])
  })

  it('returns the words after a BASH_CMDS write', () => {
    expect(
      findVariableNameCode(`BASH_CMDS[grep]=/bin/sh; grep -c 'id'`)
    ).toEqual(['grep', '-c', 'id'])
  })
})
