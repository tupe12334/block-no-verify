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

  describe('should detect LEFTHOOK=false bypass', () => {
    it('should detect LEFTHOOK=false as a command prefix', () => {
      expect(hasLefthookSkip('LEFTHOOK=false git push origin main')).toBe(true)
    })

    it('should detect quoted LEFTHOOK="false"', () => {
      expect(hasLefthookSkip('LEFTHOOK="false" git commit -m "x"')).toBe(true)
    })

    it("should detect quoted LEFTHOOK='false'", () => {
      expect(hasLefthookSkip("LEFTHOOK='false' git push")).toBe(true)
    })
  })

  describe('should detect LEFTHOOK_EXCLUDE bypass', () => {
    it('should detect a single excluded tag', () => {
      expect(
        hasLefthookSkip('LEFTHOOK_EXCLUDE=pre-commit git commit -m "x"')
      ).toBe(true)
    })

    it('should detect a quoted, comma-separated tag list', () => {
      expect(
        hasLefthookSkip('LEFTHOOK_EXCLUDE="pre-commit,pre-push" git push')
      ).toBe(true)
    })

    it('should detect in chained commands', () => {
      expect(hasLefthookSkip('ls && LEFTHOOK_EXCLUDE=lint git push')).toBe(true)
    })
  })

  describe('should not detect false positives', () => {
    it('should not detect normal git push', () => {
      expect(hasLefthookSkip('git push origin main')).toBe(false)
    })

    it('should not detect LEFTHOOK=1 (hooks enabled)', () => {
      expect(hasLefthookSkip('LEFTHOOK=1 git push origin main')).toBe(false)
    })

    it('should not detect a value that merely starts with false (LEFTHOOK=falsely)', () => {
      expect(hasLefthookSkip('LEFTHOOK=falsely git push origin main')).toBe(
        false
      )
    })

    it('should not detect an empty LEFTHOOK_EXCLUDE (excludes nothing)', () => {
      expect(hasLefthookSkip('LEFTHOOK_EXCLUDE= git push origin main')).toBe(
        false
      )
      expect(hasLefthookSkip('LEFTHOOK_EXCLUDE="" git push origin main')).toBe(
        false
      )
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
