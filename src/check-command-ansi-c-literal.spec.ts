import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// Built at runtime so the source never holds a literal bypass command.
const NV = '--no-' + 'verify'
const Q = "$'\\''" // ANSI-C quoting for one literal single-quote character

describe('checkCommand: ANSI-C quoting next to a substitution', () => {
  // `$'\''` is a single quote character, not a quote mark. The `$(…)` between
  // two of them is live code, so bash runs the git command inside it.
  it.each([
    `echo ${Q} $(git commit -m x --allow-empty ${NV}) ${Q}`,
    `echo ${Q}$(git commit -m x --allow-empty ${NV})${Q}`,
    `printf %s ${Q} \`git commit -m x --allow-empty ${NV}\` ${Q}`,
    `cat ${Q} $(git push ${NV}) ${Q}`,
  ])('blocks a live substitution between ANSI-C quotes: %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })
})
