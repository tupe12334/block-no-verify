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
    `echo 'import os; os.system("git commit -m x --no-verify")' | python3 -u -`,
  ])('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it.each([
    `echo 'print(1)' | python3`,
    `python3 <<< 'import os; os.system("git status")'`,
    `echo 'import os; os.system("git commit -m x --no-verify")' | cat`,
    // With a script or a code option, stdin is only data.
    `echo '{"tool_input":{"command":"git commit --no-verify"}}' | node dist/cli.js`,
    `node dist/cli.js <<< '{"tool_input":{"command":"git commit --no-verify"}}'`,
    `echo '{"cmd":"git commit","opt":"--no-verify"}' | python3 -m json.tool`,
    `echo '"git commit --no-verify"' | python3 script.py`,
    `echo '"git commit --no-verify"' | python3 -c 'import sys; print(sys.stdin.read())'`,
  ])('allows %s', command => {
    expect(checkCommand(command).blocked).toBe(false)
  })
})
