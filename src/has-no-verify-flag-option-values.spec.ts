// cspell:ignore Skeyn keyn keyid
import { describe, it, expect } from 'vitest'
import { hasNoVerifyFlag } from './has-no-verify-flag.js'

describe('hasNoVerifyFlag: option values and argv words', () => {
  describe('bundled short options that take a value (inline or optional)', () => {
    // A value-taking letter (-t, -m, -F, -C, -c) or an optional inline value
    // (-u[<mode>], -S[<keyid>]) ends the bundle: the rest is its value.
    it('allows -n after -t in a bundle (-tn is --template=n)', () => {
      expect(hasNoVerifyFlag('git commit -tn -m x', 'commit')).toBe(false)
    })

    it('allows -n after -u in a bundle (-uno is --untracked-files=no)', () => {
      expect(hasNoVerifyFlag('git commit -uno -m x', 'commit')).toBe(false)
    })

    it('allows -n after -S in a bundle (-Skeyn is --gpg-sign=keyn)', () => {
      expect(hasNoVerifyFlag('git commit -Skeyn -m x', 'commit')).toBe(false)
    })

    it('still blocks -n bundled before a value letter', () => {
      expect(hasNoVerifyFlag('git commit -n -m x', 'commit')).toBe(true)
      expect(hasNoVerifyFlag('git commit -qn -m x', 'commit')).toBe(true)
      expect(hasNoVerifyFlag('git commit -nq -m x', 'commit')).toBe(true)
      expect(hasNoVerifyFlag('git commit -an -m x', 'commit')).toBe(true)
    })

    it('still blocks -n as a separate token after an optional-value flag', () => {
      expect(hasNoVerifyFlag('git commit -S -n -m x', 'commit')).toBe(true)
      expect(hasNoVerifyFlag('git commit -u -n -m x', 'commit')).toBe(true)
    })

    it('skips the separate value token of -t', () => {
      expect(hasNoVerifyFlag('git commit -t -n', 'commit')).toBe(false)
      expect(hasNoVerifyFlag('git commit --template -n', 'commit')).toBe(false)
    })
  })

  describe('argv words that git does not read as a flag', () => {
    // Bash and git rules: a value option (-m, -F, ...) consumes the next word
    // even when it ends a bundle (-am), `--` ends option parsing, and a
    // redirect operand is a file name, not an argument.
    it('does not read the message of -am as a flag', () => {
      expect(hasNoVerifyFlag('git commit -am "--no-verify"', 'commit')).toBe(
        false
      )
      expect(hasNoVerifyFlag('git commit -am "-n"', 'commit')).toBe(false)
    })

    it('reads a flag after the message of -am as a flag', () => {
      expect(hasNoVerifyFlag('git commit -am "x" --no-verify', 'commit')).toBe(
        true
      )
    })

    it('reads a flag after -- when -am takes -- as its message', () => {
      expect(hasNoVerifyFlag('git commit -am -- --no-verify', 'commit')).toBe(
        true
      )
    })

    it('keeps scanning a flag-shaped word after -- (fail closed)', () => {
      expect(hasNoVerifyFlag('git commit -- --no-verify', 'commit')).toBe(true)
      expect(hasNoVerifyFlag('git commit -- -n', 'commit')).toBe(true)
    })

    it('blocks a flag after an option that may take -- as its value', () => {
      expect(
        hasNoVerifyFlag(
          'git push -o -- --no-verify origin HEAD:refs/heads/new',
          'push'
        )
      ).toBe(true)
      expect(
        hasNoVerifyFlag(
          'git commit --trailer -- -n -m x --allow-empty',
          'commit'
        )
      ).toBe(true)
    })

    it('blocks a flag in a second command on a later line', () => {
      expect(
        hasNoVerifyFlag(
          'git commit -m x --allow-empty -- f\ngit commit -m x --allow-empty -n',
          'commit'
        )
      ).toBe(true)
    })

    it('still reads a flag before -- as a flag', () => {
      expect(
        hasNoVerifyFlag('git commit --no-verify -- file.txt', 'commit')
      ).toBe(true)
    })

    it('reads a git flag after the -- of another program', () => {
      expect(
        hasNoVerifyFlag('command -- git commit --no-verify', 'commit')
      ).toBe(true)
    })

    it('does not read a redirect file name as a flag', () => {
      expect(
        hasNoVerifyFlag('git commit -m safe > --no-verify', 'commit')
      ).toBe(false)
      expect(
        hasNoVerifyFlag('git commit -m safe 2> --no-verify', 'commit')
      ).toBe(false)
    })

    it('still reads a flag after a redirect operand', () => {
      expect(
        hasNoVerifyFlag('git commit -m x > /dev/null --no-verify', 'commit')
      ).toBe(true)
      expect(hasNoVerifyFlag('git commit 2>/dev/null -n', 'commit')).toBe(true)
    })

    it('keeps blocking a bare -n after a backslash program word (fail closed)', () => {
      expect(hasNoVerifyFlag('"git""\\.exe" commit -n -m x', 'commit')).toBe(
        true
      )
    })
  })
})
