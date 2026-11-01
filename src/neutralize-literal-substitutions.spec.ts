import { describe, it, expect } from 'vitest'
import { neutralizeLiteralSubstitutions } from './neutralize-literal-substitutions.js'

const NEUTRAL = '\u0001'

describe('neutralizeLiteralSubstitutions', () => {
  it('neutralizes a $( inside single quotes', () => {
    expect(neutralizeLiteralSubstitutions("echo '$(git push)'")).toBe(
      `echo '${NEUTRAL}(git push)'`
    )
  })

  it('neutralizes a backtick inside single quotes', () => {
    expect(neutralizeLiteralSubstitutions("echo '`git push`'")).toBe(
      `echo '${NEUTRAL}git push${NEUTRAL}'`
    )
  })

  it('neutralizes an escaped $( inside double quotes', () => {
    expect(neutralizeLiteralSubstitutions('echo "\\$(git push)"')).toBe(
      `echo "\\${NEUTRAL}(git push)"`
    )
  })

  it('neutralizes an escaped backtick outside quotes', () => {
    expect(neutralizeLiteralSubstitutions('echo \\`git push\\`')).toBe(
      `echo \\${NEUTRAL}git push\\${NEUTRAL}`
    )
  })

  it('leaves a live $( inside double quotes unchanged', () => {
    expect(neutralizeLiteralSubstitutions('echo "$(git push)"')).toBe(
      'echo "$(git push)"'
    )
  })

  it('leaves a live $( in code unchanged', () => {
    expect(neutralizeLiteralSubstitutions('echo $(git push)')).toBe(
      'echo $(git push)'
    )
  })

  it('leaves a live backtick in double quotes unchanged', () => {
    expect(neutralizeLiteralSubstitutions('echo "`git push`"')).toBe(
      'echo "`git push`"'
    )
  })

  it('keeps a live substitution after a quote inside another one', () => {
    const input = `echo "$( echo ')' ) '$(git commit -n)'"`
    expect(neutralizeLiteralSubstitutions(input)).toBe(input)
  })

  it('leaves a single-quoted $( that follows a live substitution neutralized', () => {
    expect(neutralizeLiteralSubstitutions("echo $(echo x) '$(git push)'")).toBe(
      `echo $(echo x) '${NEUTRAL}(git push)'`
    )
  })
})
