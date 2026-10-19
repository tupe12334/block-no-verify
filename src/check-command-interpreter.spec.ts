import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// Interpreter code can run git from a string literal (#101).
describe('checkCommand: interpreter code strings', () => {
  it.each([
    `python3 -c "import os; os.system('git commit --no-verify -m x')"`,
    `python -c "import subprocess; subprocess.run('git push --no-verify', shell=True)"`,
    `perl -e 'system("git commit --no-verify -m x")'`,
    `ruby -e 'system "git push --no-verify"'`,
    `node -e "require('child_process').execSync('git commit --no-verify -m x')"`,
  ])('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it.each([
    `python3 -c "print('hello')"`,
    `python3 -c "import os; os.system('git status')"`,
    `node -e "console.log('a b')"`,
    'python3 script.py --no-verify',
  ])('allows %s', command => {
    expect(checkCommand(command).blocked).toBe(false)
  })
})
