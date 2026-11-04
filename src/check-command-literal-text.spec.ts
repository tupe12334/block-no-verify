import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

describe('checkCommand literal shell text', () => {
  describe('allows a substitution or heredoc that bash never runs', () => {
    it.each([
      "printf '%s' '$(git push --no-verify)'",
      'echo "\\$(git push --no-verify)"',
      'echo "\\`git push --no-verify\\`"',
      'cat <<\\EOF\ngit push --no-verify\nEOF',
      'cat <<EOF\ngit commit --no-verify\nEOF',
      "bash -c 'cat' <<EOF\ngit commit -q -m x\nEOF",
      'cat <<A\nsafe\nA',
    ])('allows %j', command => {
      expect(checkCommand(command).blocked).toBe(false)
    })
  })

  describe('allows single-quoted ${…} text that bash never expands', () => {
    it.each([
      "echo '${a b}'",
      "grep -rn '${JSON.stringify(' src",
      "git commit -m x && echo '${f(x)}'",
      'git commit -m "fix LEFTHOOK=0 bypass" && echo \'${a b}\'',
      "echo '\\\\${a b}'",
    ])('allows %j', command => {
      expect(checkCommand(command).blocked).toBe(false)
    })
  })

  describe('still blocks an override next to single-quoted ${…} text', () => {
    it.each([
      "git -c core.hooks'Path'=/dev/null commit -m x; echo '${a b}'",
      'echo \'${a b}\'; git "-c" "core.hooksPath=/dev/null" commit -m x',
      "HUSKY=0'' git commit -m x; echo '${a b}'",
      "git commit --no-verify -m x; echo '${a b}'",
    ])('blocks %j', command => {
      expect(checkCommand(command).blocked).toBe(true)
    })
  })

  // ANSI-C quoting is not expanded, so its quote pairs may differ from bash.
  // Text that mixes it with a substitution is checked anyway (fail closed),
  // even where bash would print the substitution as text.
  it('blocks a substitution inside ANSI-C quoting (fail closed)', () => {
    expect(checkCommand("echo $'$(git push --no-verify)'").blocked).toBe(true)
  })

  describe('still blocks a shell that runs the text', () => {
    it.each([
      'echo "$(git push --no-verify)"',
      'bash <<EOF\ngit commit --no-verify -m x\nEOF',
      'sh -s <<EOF\ngit push --no-verify\nEOF',
      "echo \"$( echo ')' ) '$(git commit -n)'\"",
      "printf '%s' '$(x)'; echo \"$(git commit --no-verify)\"",
      'cat <<A\n$(git push --no-verify)\nA',
      'cat <<A <<B\nsafe\nA\n$(git push --no-verify)\nB',
    ])('blocks %j', command => {
      expect(checkCommand(command).blocked).toBe(true)
    })
  })
})
