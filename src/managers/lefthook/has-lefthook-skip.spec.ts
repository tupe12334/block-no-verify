import { describe, it, expect } from 'vitest'
import { hasLefthookSkip } from './has-lefthook-skip.js'

describe('hasLefthookSkip', () => {
  describe('should detect LEFTHOOK=0 bypass', () => {
    it('should detect LEFTHOOK=0 as a command prefix', () => {
      expect(hasLefthookSkip('LEFTHOOK=0 git push origin main')).toBe(true)
    })

    it('should detect LEFTHOOK=0 with commit', () => {
      expect(hasLefthookSkip('LEFTHOOK=0 git commit -m "test"')).toBe(true)
    })

    it('should detect quoted value with double quotes', () => {
      expect(hasLefthookSkip('LEFTHOOK="0" git push origin main')).toBe(true)
    })

    it('should detect quoted value with single quotes', () => {
      expect(hasLefthookSkip("LEFTHOOK='0' git push origin main")).toBe(true)
    })

    it('should detect in chained commands', () => {
      expect(hasLefthookSkip('ls && LEFTHOOK=0 git push origin main')).toBe(
        true
      )
    })
  })

  describe('should not detect false positives', () => {
    it('should not detect normal git push', () => {
      expect(hasLefthookSkip('git push origin main')).toBe(false)
    })

    it('should not detect LEFTHOOK=1 (hooks enabled)', () => {
      expect(hasLefthookSkip('LEFTHOOK=1 git push origin main')).toBe(false)
    })

    it('should not detect a different variable ending in LEFTHOOK', () => {
      expect(hasLefthookSkip('OTHER_LEFTHOOK=0 git push origin main')).toBe(
        false
      )
    })

    it('should not detect empty input', () => {
      expect(hasLefthookSkip('')).toBe(false)
    })
  })
})
