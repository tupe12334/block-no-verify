import { describe, it, expect } from 'vitest'
import { hasPreCommitSkip } from './has-pre-commit-skip.js'

describe('hasPreCommitSkip', () => {
  describe('should detect SKIP= bypass', () => {
    it('should detect SKIP=pre-push', () => {
      expect(hasPreCommitSkip('SKIP=pre-push git push origin main')).toBe(true)
    })

    it('should detect SKIP=pre-commit with commit', () => {
      expect(hasPreCommitSkip('SKIP=pre-commit git commit -m "test"')).toBe(
        true
      )
    })

    it('should detect SKIP=* (all hooks)', () => {
      expect(hasPreCommitSkip('SKIP=* git push origin main')).toBe(true)
    })

    it('should detect SKIP=hook1,hook2', () => {
      expect(hasPreCommitSkip('SKIP=hook1,hook2 git commit -m "test"')).toBe(
        true
      )
    })

    it('should detect quoted value with double quotes', () => {
      expect(hasPreCommitSkip('SKIP="pre-push" git push origin main')).toBe(
        true
      )
    })

    it('should detect quoted value with single quotes', () => {
      expect(hasPreCommitSkip("SKIP='pre-push' git push origin main")).toBe(
        true
      )
    })

    it('should detect in chained commands', () => {
      expect(hasPreCommitSkip('ls && SKIP=pre-push git push origin main')).toBe(
        true
      )
    })
  })

  describe('should not detect false positives', () => {
    it('should not detect normal git push', () => {
      expect(hasPreCommitSkip('git push origin main')).toBe(false)
    })

    it('should not detect empty SKIP=', () => {
      expect(hasPreCommitSkip('SKIP= git push origin main')).toBe(false)
    })

    it('should not detect a variable ending in SKIP', () => {
      expect(hasPreCommitSkip('NO_SKIP=pre-push git push origin main')).toBe(
        false
      )
    })

    it('should not detect empty input', () => {
      expect(hasPreCommitSkip('')).toBe(false)
    })
  })
})
