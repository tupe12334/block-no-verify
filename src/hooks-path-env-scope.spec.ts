// cspell:ignore allexport shopt
import { describe, it, expect } from 'vitest'
import { hasHooksPathOverride } from './has-hooks-path-override.js'

const HP = 'core.hooks' + 'Path'
const OVERRIDE = `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=${HP} GIT_CONFIG_VALUE_0=/dev/null`
const PARAMS = `GIT_CONFIG_PARAMETERS="'${HP}=/dev/null'"`
const COMMIT = 'git commit -m x --allow-empty'

describe('hasHooksPathOverride scope', () => {
  describe('allows an override that cannot reach a hook-running git command', () => {
    it.each([
      `${OVERRIDE} git status`,
      `${OVERRIDE} echo 'git push --no-verify'`,
      `${PARAMS} echo safe`,
      `${PARAMS} git status; git status`,
      `GIT_CONFIG_COUNT=0 GIT_CONFIG_KEY_0=${HP} GIT_CONFIG_VALUE_0=/dev/null git status`,
      `git --config-env=${HP}=HP status`,
      `echo 'HP=/dev/null git --config-env=${HP}=HP commit'`,
      `export ${PARAMS}; git status`,
    ])('allows %j', command => {
      expect(hasHooksPathOverride(command)).toBe(false)
    })
  })

  describe('blocks an override that may reach a hook-running git command', () => {
    it.each([
      `${OVERRIDE} git commit -m x`,
      `${PARAMS} git commit -m x`,
      `${PARAMS} env git commit -m x`,
      `${PARAMS} env -i git commit -m x`,
      `${OVERRIDE} exec -c git commit -m x`,
      `${PARAMS}; git commit -m x`,
      `${OVERRIDE}; git commit -m x`,
      `${PARAMS} eval 'git commit -m x'`,
      `export ${PARAMS}; git commit -m x`,
      `${OVERRIDE}; export GIT_CONFIG_COUNT=1; git status; git commit -m x`,
      `set -o allexport; ${OVERRIDE}; ${COMMIT}`,
      `set -o allexport; ${PARAMS}; ${COMMIT}`,
      `f(){ ${COMMIT}; }; ${OVERRIDE} f`,
      `function f { ${COMMIT}; }; ${OVERRIDE} f`,
      `f(){ ${COMMIT}; }; ${PARAMS} f`,
      `alias g='${COMMIT}'\n${OVERRIDE} g`,
      `printf 'commit\\n-m\\nx\\n--allow-empty\\n' | ${OVERRIDE} xargs git`,
      `GIT_CONFIG_PARAMETERS+="'${HP}=/dev/null'" ${COMMIT}`,
      `git --config-env=${HP}=HP commit -m x`,
      `GIT_CONFIG_PARAMETERS="'user.name'='x' '${HP}'='/dev/null'" git commit -m x`,
    ])('blocks %j', command => {
      expect(hasHooksPathOverride(command)).toBe(true)
    })
  })
})
