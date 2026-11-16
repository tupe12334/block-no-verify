import { describe, it, expect, vi } from 'vitest'
import type { HookEvent, HookResponse } from '@polyhook/sdk'
import { runHook } from './run-hook.js'
import type { HookSdk } from './hook-sdk.js'

function makeSdk(): HookSdk {
  return {
    respond: vi.fn().mockResolvedValue(undefined),
    block: vi.fn(
      (message: string): HookResponse => ({ action: 'block', message })
    ),
    approve: vi.fn((): HookResponse => ({ action: 'approve' })),
  }
}

function bashEvent(command: string): HookEvent {
  return {
    event: 'tool:before',
    sessionId: 'test-session',
    caller: 'claude-code',
    tool: 'Bash',
    input: { command },
    output: null,
  }
}

// `shell-quote` throws "Bad substitution" on `${x:-$(…)}` outside quotes. Text
// in single quotes, or escaped, is never expanded by the shell, so it must
// never reach that parse: the message-masking rebuild used to drop its quotes.
describe('runHook: ${…:-$(…)} text the shell never expands', () => {
  describe('allows', () => {
    it.each([
      `printf '%s\\n' 'echo \${x:-$(( (echo x > f) ))}' > /tmp/probe.sh`,
      `ssh host 'bash -c "echo \\\${x:-\\$(( (echo x > f) ))}"'`,
      `git status && printf '%s' '\${x:-$(( 1 ))}'`,
      `git commit -m msg && printf '%s' '\${x:-$(( 1 ))}'`,
      `printf '%s' "\\\${x:-\\$(( 1 ))}" > f`,
    ])('%s', async command => {
      const result = await runHook(bashEvent(command), makeSdk())
      expect(result.blocked).toBe(false)
    })
  })

  // Overrides whose value holds a `$`: the rebuilt text must still match the
  // regex checks that start at `NAME=` or `core.hooksPath=`.
  describe('still blocks an override with $ in its value', () => {
    it.each([
      'HUSKY=0$Z git commit -m x',
      'git -c core.hooksPath=$HOME/x commit -m x',
      'git -c "core.hooksPath=$D" commit -m x',
      'git -c core.hooksPath=/dev/null$X commit -m x',
      'GIT_CONFIG_PARAMETERS=$P git commit -m x',
      'git commit -m "$(date)" --no-verify',
      `git -c 'core.hooksPath=/x$y' commit -m x`,
      `git -c core.hooksPath='$HOME/x' commit -m x`,
      `git '-c' 'core.hooksPath=$x' commit -m x`,
      `git config core.hooksPath '/x$y'`,
      `git config 'core.hooksPath' '$y'`,
      `git --config-env='core.hooksPath=$V' commit -m x`,
      `GIT_CONFIG_PARAMETERS="'core.hooksPath'='$x'" git commit -m x`,
      `GIT_CONFIG_PARAMETERS='$P' git commit -m x`,
      `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0='$x' git commit -m x`,
      `LEFTHOOK_EXCLUDE='lint$x' git commit -m x`,
      `LEFTHOOK_EXCLUDE='$x' git commit -m x`,
      `SKIP='lint$x' git commit -m x`,
      `SKIP='$x' git commit -m x`,
    ])('%s', async command => {
      const result = await runHook(bashEvent(command), makeSdk())
      expect(result.blocked).toBe(true)
    })
  })

  // A `-c` payload runs, and outside quotes `${x:-$(…)}` cannot be read:
  // `${x:-$(echo git commit -n)}` alone runs `git commit -n`. Still fail closed.
  describe('still fails closed on a payload the shell expands', () => {
    it.each([
      `B=/bin/bash; $B -c 'echo \${x:-$(( (echo x > f) ))}'`,
      'echo ${x:-$(( (echo x > f) ))}',
      '${x:-$(echo git commit -n -m x)}',
    ])('%s', async command => {
      const result = await runHook(bashEvent(command), makeSdk())
      expect(result.blocked).toBe(true)
      expect(result.reason).toContain('could not parse')
    })
  })

  describe('still blocks', () => {
    it.each([
      'git commit --no-verify -m x',
      'git commit -n -m x',
      'git -c core.hooksPath=/dev/null commit -m x',
      'HUSKY=0 git commit -m x',
      `bash -c 'git commit --no-verify -m x'`,
      `bash -c 'git commit -n -m x'`,
      `bash -c 'git -c core.hooksPath=/dev/null commit -m x'`,
      `bash -c 'HUSKY=0 git commit -m x'`,
      'echo $(git commit --no-verify -m x)',
      'echo $(git -c core.hooksPath=/dev/null commit -m x)',
      'echo $(HUSKY=0 git commit -m x)',
      `eval 'git commit -n -m x'`,
      `eval 'git -c core.hooksPath=/dev/null commit -m x'`,
      `eval 'HUSKY=0 git commit -m x'`,
      'echo "${x:-$(git commit -n -m x)}"',
      'echo ${x:-$(git commit -n -m x)}',
      `bash -c 'echo \${x:-$(git commit -n -m x)}'`,
      `B=/bin/bash; $B -c 'echo \${x:-$(( 1 ))}; git commit -n -m x'`,
      `printf '%s' '\${x:-$(( 1 ))}' && HUSKY=0 git commit -m x`,
      `printf '%s' '\${x:-$(( 1 ))}' && git commit -n -m x`,
    ])('%s', async command => {
      const sdk = makeSdk()
      const result = await runHook(bashEvent(command), sdk)
      expect(result.blocked).toBe(true)
      expect(sdk.approve).not.toHaveBeenCalled()
    })
  })
})
