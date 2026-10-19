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
    // argv lists, option spellings and more runtimes.
    `python3 -c "import subprocess; subprocess.run(['git', 'commit', '--no-verify', '-m', 'x'])"`,
    `node -e "require('child_process').execFileSync('git', ['push', '--no-verify'])"`,
    `python3 -Ic "import os; os.system('git commit --no-verify -m x')"`,
    `node --eval="require('child_process').execSync('git push --no-verify')"`,
    `node -p "require('child_process').execSync('git push --no-verify')"`,
    `perl -we 'system("git commit --no-verify -m x")'`,
    `bun -e "Bun.spawnSync(['git', 'push', '--no-verify'])"`,
    `deno eval "new Deno.Command('git', {args: ['push', '--no-verify']}).outputSync()"`,
    `php -r 'system("git commit --no-verify -m x");'`,
    `lua -e 'os.execute("git push --no-verify")'`,
    // node -r takes a module, then -e still holds the code.
    `node -r x -e "require('child_process').execSync('git push --no-verify')"`,
    // Code attached to its option.
    `python3 -c"import os; os.system('git commit --no-verify -m x')"`,
    `perl -e'system("git commit --no-verify -m x")'`,
    // Perl and Ruby quote operators, and awk programs.
    `perl -e 'system qq{git push --no-verify}'`,
    `perl -e 'qx{git commit --no-verify -m x}'`,
    `ruby -e 'system %q(git push --no-verify)'`,
    `ruby -e '%x(git push --no-verify)'`,
    `awk 'BEGIN{system("git push --no-verify")}'`,
    `gawk -F: 'BEGIN{system("git commit --no-verify -m x")}' /etc/passwd`,
  ])('blocks %s', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it.each([
    `python3 -c "print('hello')"`,
    `python3 -c "import os; os.system('git status')"`,
    `node -e "console.log('a b')"`,
    "awk -F: '{print $1}' /etc/passwd",
    "perl -e 'my $q = 1; print qq{hi}'",
    'python3 script.py --no-verify',
  ])('allows %s', command => {
    expect(checkCommand(command).blocked).toBe(false)
  })
})
