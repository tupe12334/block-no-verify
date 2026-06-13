import { describe, it, expect } from 'vitest'
import { hasHuskySkip } from './has-husky-skip.js'

describe('hasHuskySkip', () => {
  describe('should detect HUSKY=0 bypass', () => {
    it('should detect HUSKY=0 as a command prefix', () => {
      expect(hasHuskySkip('HUSKY=0 git commit -m "test"')).toBe(true)
    })

    it('should detect HUSKY=0 with push', () => {
      expect(hasHuskySkip('HUSKY=0 git push origin main')).toBe(true)
    })

    it('should detect quoted value with double quotes', () => {
      expect(hasHuskySkip('HUSKY="0" git commit -m "test"')).toBe(true)
    })

    it('should detect quoted value with single quotes', () => {
      expect(hasHuskySkip("HUSKY='0' git commit -m 'test'")).toBe(true)
    })

    it('should detect export HUSKY=0', () => {
      expect(hasHuskySkip('export HUSKY=0; git commit -m "test"')).toBe(true)
    })

    it('should detect env HUSKY=0', () => {
      expect(hasHuskySkip('env HUSKY=0 git commit -m "test"')).toBe(true)
    })

    it('should detect in chained commands', () => {
      expect(hasHuskySkip('ls && HUSKY=0 git push origin main')).toBe(true)
    })
  })

  describe('should not detect false positives', () => {
    it('should not detect normal git commit', () => {
      expect(hasHuskySkip('git commit -m "test"')).toBe(false)
    })

    it('should not detect HUSKY=1 (hooks enabled)', () => {
      expect(hasHuskySkip('HUSKY=1 git commit -m "test"')).toBe(false)
    })

    it('should not detect HUSKY=2', () => {
      expect(hasHuskySkip('HUSKY=2 git commit -m "test"')).toBe(false)
    })

    it('should not detect a different variable ending in HUSKY', () => {
      expect(hasHuskySkip('OTHER_HUSKY=0 git commit -m "test"')).toBe(false)
    })

    it('should not detect HUSKY=0 inside a quoted commit message', () => {
      expect(hasHuskySkip('git commit -m "set HUSKY=0"')).toBe(false)
    })

    it('should not detect non-git commands', () => {
      expect(hasHuskySkip('npm install')).toBe(false)
    })

    it('should not detect empty input', () => {
      expect(hasHuskySkip('')).toBe(false)
    })
  })
})
