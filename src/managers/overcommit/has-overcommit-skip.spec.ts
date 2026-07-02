import { describe, it, expect } from 'vitest'
import { hasOvercommitSkip } from './has-overcommit-skip.js'

describe('hasOvercommitSkip', () => {
  describe('should detect OVERCOMMIT_DISABLE=1 bypass', () => {
    it('should detect OVERCOMMIT_DISABLE=1 as a command prefix', () => {
      expect(
        hasOvercommitSkip('OVERCOMMIT_DISABLE=1 git push origin main')
      ).toBe(true)
    })

    it('should detect OVERCOMMIT_DISABLE=1 with commit', () => {
      expect(
        hasOvercommitSkip('OVERCOMMIT_DISABLE=1 git commit -m "test"')
      ).toBe(true)
    })

    it('should detect quoted value with double quotes', () => {
      expect(
        hasOvercommitSkip('OVERCOMMIT_DISABLE="1" git push origin main')
      ).toBe(true)
    })

    it('should detect quoted value with single quotes', () => {
      expect(
        hasOvercommitSkip("OVERCOMMIT_DISABLE='1' git push origin main")
      ).toBe(true)
    })

    it('should detect in chained commands', () => {
      expect(
        hasOvercommitSkip('ls && OVERCOMMIT_DISABLE=1 git push origin main')
      ).toBe(true)
    })
  })

  describe('should not detect false positives', () => {
    it('should not detect normal git push', () => {
      expect(hasOvercommitSkip('git push origin main')).toBe(false)
    })

    it('should not detect OVERCOMMIT_DISABLE=0 (hooks enabled)', () => {
      expect(
        hasOvercommitSkip('OVERCOMMIT_DISABLE=0 git push origin main')
      ).toBe(false)
    })

    it('should not detect empty input', () => {
      expect(hasOvercommitSkip('')).toBe(false)
    })
  })
})
