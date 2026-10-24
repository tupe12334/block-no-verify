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

  describe('git config core.hooksPath (persistent override)', () => {
    it('should detect git config core.hooksPath /tmp/empty', () => {
      expect(hasHooksPathOverride('git config core.hooksPath /tmp/empty')).toBe(
        true
      )
    })

    it('should detect git config --global core.hooksPath', () => {
      expect(
        hasHooksPathOverride('git config --global core.hooksPath /dev/null')
      ).toBe(true)
    })

    it('should detect git config core.hooksPath=<value>', () => {
      expect(hasHooksPathOverride('git config core.hooksPath=/dev/null')).toBe(
        true
      )
    })

    it('should not detect a bare read of core.hooksPath', () => {
      expect(hasHooksPathOverride('git config core.hooksPath')).toBe(false)
    })

    it('should not detect --get core.hooksPath', () => {
      expect(hasHooksPathOverride('git config --get core.hooksPath')).toBe(
        false
      )
    })

    it('should not detect --unset core.hooksPath', () => {
      expect(hasHooksPathOverride('git config --unset core.hooksPath')).toBe(
        false
      )
    })
  })

  describe('GIT_CONFIG_* environment variable injection (Group C bypass — issue #56)', () => {
    it('should detect GIT_CONFIG_COUNT + GIT_CONFIG_KEY_i=core.hooksPath', () => {
      expect(
        hasHooksPathOverride(
          'GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/dev/null git push'
        )
      ).toBe(true)
    })

    it('should detect GIT_CONFIG_PARAMETERS containing core.hooksPath', () => {
      expect(
        hasHooksPathOverride(
          'GIT_CONFIG_PARAMETERS="\'core.hooksPath=/dev/null\'" git push'
        )
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

    it('should not detect a bare lowercase read', () => {
      expect(hasHooksPathOverride('git config core.hookspath')).toBe(false)
    })

    // `config` and the key used to be tested independently, so any command
    // mentioning both anywhere was blocked even when it set nothing (#130).
    describe('prose mentioning config and the key (#130)', () => {
      it.each([
        "echo 'core.hooksPath via -c and git config'",
        "echo 'git config and core.hooksPath = somewhere'",
        "grep -rn config webpack.config.js && echo 'core.hooksPath'",
        'git config --get core.hooksPath && echo done',
        'git config --unset core.hooksPath',
      ])('%s', command => {
        expect(hasHooksPathOverride(command)).toBe(false)
      })
    })
  })

  // The space-separated set form still blocks, including through option words
  // and a wrapper that runs the command (#130).
  describe('still detects a config set of the key', () => {
    it.each([
      'git config core.hooksPath /dev/null',
      'git config core.hooksPath "/tmp/a b"',
      'git config --global core.hooksPath /tmp/h',
      'git config --local core.hooksPath /tmp/h',
      'git config core.hooksPath=/dev/null',
      'sudo git config --system core.hooksPath /tmp',
      'bash -c "git config core.hooksPath /tmp"',
      "echo 'git config core.hooksPath /tmp' | sh",
    ])('%s', command => {
      expect(hasHooksPathOverride(command)).toBe(true)
    })
  })

  // Git config keys are case-insensitive (#91).
  describe('should detect any key casing', () => {
    it.each([
      'git -c core.hookspath=/dev/null commit -m x',
      'git -c CORE.HOOKSPATH=/dev/null commit -m x',
      "git -c 'Core.HooksPath=/tmp' push",
      'GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hookspath GIT_CONFIG_VALUE_0=/dev/null git commit',
      `GIT_CONFIG_PARAMETERS="'core.hookspath'='/dev/null'" git commit`,
      'git config core.hookspath /dev/null',
      'git config --global CORE.HOOKSPATH=/tmp/none',
    ])('%s', command => {
      expect(hasHooksPathOverride(command)).toBe(true)
    })
  })
})
