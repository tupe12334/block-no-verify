import { describe, it, expect } from 'vitest'
import { findSshCommands } from './find-ssh-commands.js'

describe('findSshCommands', () => {
  it.each([
    ['ssh host "git status"', ['git status']],
    ['ssh -p 22 me@host ls -la', ['ls -la']],
    ['ssh -p22 host make', ['make']],
    ['ssh -vp 22 host make', ['make']],
    ['ssh -o A=b -- host "a; b"', ['a; b']],
    ['ssh h a && ssh h b', ['a', 'b']],
  ])('reads %s', (input, commands) => {
    expect(findSshCommands(input)).toEqual(commands)
  })

  it.each(['ssh host', 'ssh -p 22 host', 'ssh-keygen -t ed25519', 'echo ssh'])(
    'finds nothing in %s',
    input => {
      expect(findSshCommands(input)).toEqual([])
    }
  )
})
