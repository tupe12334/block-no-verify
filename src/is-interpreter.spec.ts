import { describe, it, expect } from 'vitest'
import { isInterpreter } from './is-interpreter.js'

describe('isInterpreter', () => {
  it.each(['python3', 'python3.12', 'perl', 'ruby', 'node', 'lua'])(
    'accepts %s',
    name => {
      expect(isInterpreter(name)).toBe(true)
    }
  )

  it.each(['sh', 'git', 'python-config', 'awk'])('rejects %s', name => {
    expect(isInterpreter(name)).toBe(false)
  })
})
