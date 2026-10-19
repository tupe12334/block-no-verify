import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// Code fed to an interpreter on stdin can run git from a literal (#101).
describe('checkCommand: code fed to an interpreter', () => {
  it.each([
    `echo 'import os; os.system("git commit -m x --no-verify")' | python3`,
    `python3 <<< 'import os; os.system("git commit -m x --no-verify")'`,
    `printf '%s' 'system "git commit -m x --no-verify"' | perl`,
    `echo 'system %x(git commit -m x --no-verify)' | ruby`,
    `echo "require('child_process').execSync('git commit -m x --no-verify')" | node`,
    `echo "import subprocess; subprocess.run(['git', 'push', '--no-verify'])" | python3 -`,
    `cat <<< 'import os; os.system("git commit -m x --no-verify")' | sudo python3`,
  ])('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it.each([
    `echo 'print(1)' | python3`,
    `python3 <<< 'import os; os.system("git status")'`,
    `echo 'import os; os.system("git commit -m x --no-verify")' | cat`,
  ])('allows %s', command => {
    expect(checkCommand(command).blocked).toBe(false)
  })
})
