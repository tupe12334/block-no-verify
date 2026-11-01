import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// Built at run time, so the override never appears as literal text.
const HP = 'core.' + 'hooksPath'
const CFG = `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=${HP} GIT_CONFIG_VALUE_0=/dev/null`
const PAR = `GIT_CONFIG_PARAMETERS="'${HP}=/dev/null'"`
const COMMIT = 'git commit -m x --allow-empty'

describe('core.hooksPath override is blocked for every git subcommand', () => {
  it.each([
    `${CFG} git branch nb`,
    `${CFG} git tag t1`,
    `${CFG} git pull origin main`,
    `${CFG} git checkout -b nb`,
    `${CFG} git switch -c nb`,
    `${CFG} git update-ref refs/heads/q HEAD`,
    `${CFG} git worktree add ../wt`,
    `${CFG} git stash`,
    `${CFG} git fetch origin`,
    `${CFG} git reset --hard HEAD~1`,
    `${CFG} git status`,
    `${CFG} echo hi`,
    `${PAR} echo safe`,
    `git --config-env=${HP}=HP status`,
  ])('blocks %j', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it.each([
    `cat(){ ${COMMIT}; }; ${CFG} cat x`,
    `cat () { ${COMMIT}; }; ${CFG} cat x`,
    `function cat { ${COMMIT}; }; ${CFG} cat x`,
    `echo(){ ${COMMIT}; }; ${CFG} echo hi`,
    `grep(){ ${COMMIT}; }; ${PAR} grep x`,
    `git(){ command git ${COMMIT}; }; ${CFG} git status`,
    `cat(){ ${COMMIT}; }; cat x; ${CFG} cat x`,
  ])('blocks a shadowing function: %j', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })
})
