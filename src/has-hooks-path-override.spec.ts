import { describe, it, expect } from 'vitest'
import { hasHooksPathOverride } from './has-hooks-path-override.js'

describe('hasHooksPathOverride', () => {
  describe('should detect core.hooksPath override', () => {
    it('should detect -c core.hooksPath=/dev/null', () => {
      expect(hasHooksPathOverride('git -c core.hooksPath=/dev/null push')).toBe(
        true
      )
    })

    it('should detect -c core.hooksPath= (empty value)', () => {
      expect(hasHooksPathOverride('git -c core.hooksPath= push')).toBe(true)
    })

    it('should detect -c core.hooksPath=/tmp/empty', () => {
      expect(
        hasHooksPathOverride(
          'git -c core.hooksPath=/tmp/empty commit -m "test"'
        )
      ).toBe(true)
    })

    it('should detect quoted value with double quotes', () => {
      expect(
        hasHooksPathOverride('git -c "core.hooksPath=/dev/null" push')
      ).toBe(true)
    })

    it('should detect quoted value with single quotes', () => {
      expect(
        hasHooksPathOverride("git -c 'core.hooksPath=/dev/null' push")
      ).toBe(true)
    })

    it('should detect with extra whitespace', () => {
      expect(
        hasHooksPathOverride('git  -c  core.hooksPath=/dev/null  push')
      ).toBe(true)
    })

    it('should detect in chained commands', () => {
      expect(
        hasHooksPathOverride(
          'ls && git -c core.hooksPath=/dev/null push origin main'
        )
      ).toBe(true)
    })

    it('should detect with commit command', () => {
      expect(
        hasHooksPathOverride('git -c core.hooksPath=/dev/null commit -m "test"')
      ).toBe(true)
    })
  })

  describe('should not detect false positives', () => {
    it('should not detect normal git push', () => {
      expect(hasHooksPathOverride('git push origin main')).toBe(false)
    })

    it('should not detect other -c config values', () => {
      expect(
        hasHooksPathOverride('git -c user.name="test" commit -m "test"')
      ).toBe(false)
    })

    it('should not detect hooksPath in commit message', () => {
      expect(
        hasHooksPathOverride('git commit -m "fix core.hooksPath= issue"')
      ).toBe(false)
    })

    it('should not detect non-git commands', () => {
      expect(hasHooksPathOverride('npm install')).toBe(false)
    })

    it('should not detect empty input', () => {
      expect(hasHooksPathOverride('')).toBe(false)
    })
  })
})
