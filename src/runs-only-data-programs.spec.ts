import { describe, it, expect } from 'vitest'
import { runsOnlyDataPrograms } from './runs-only-data-programs.js'

describe('runsOnlyDataPrograms', () => {
  it.each([
    'echo "git commit -m x" | grep -n commit',
    'echo "git commit -m x" | cat -n',
    'echo "git commit -m x" > notes.txt && grep -n commit notes.txt',
    'grep -n "git commit" *.md 2>/dev/null',
    'echo "git commit -m x" | tee out.txt | grep -n x',
    'echo "git commit" | xargs -n 1 echo',
    'echo "git commit" | xargs -0 -n1 -P 4 grep -n x',
    'echo x;',
  ])('is true for %j', command => {
    expect(runsOnlyDataPrograms(command)).toBe(true)
  })

  it.each([
    // a program that runs code, or that is not named plainly
    'echo "git commit" | sh',
    'echo x | sed -n p',
    '/bin/grep -n x f',
    'X=1 grep -n x f',
    '*grep -n x f',
    // xargs running something else, or options this check does not read
    'echo "git commit" | xargs -n 9 sh -c "$0 -n"',
    'echo x | xargs',
    'echo x | xargs -I{} echo {}',
    'echo x | xargs -J echo sh',
    'echo x | xargs --process-slot-var echo sh',
    // text the shell may run, or statements the tokenizer joins
    'echo "$(git commit -n)" | grep -n x',
    'grep -n x `ls`',
    'cat <(git commit -n)',
    '(echo x | grep -n x)',
    'grep() ( eval "git commit $*" ); grep -n x',
    'echo x\nbash s.sh -n',
    // ANSI-C quoting can make a live substitution look quoted
    "echo $'\\'' $(git commit -n) $'\\'' | grep -n x",
    // quoted text that bash or zsh still runs
    "printf -v 'a[$(git commit -n)]' x | grep -n x",
    "echo ${(e):-'$(git commit -n)'} | grep -n x",
    // expansions the tokenizer drops, and a continuation that hides `$(`
    'echo "${HOME}" x | grep -n x',
    'echo x; "$_"cat -n',
    'echo "$1" | grep -n x',
    'echo \\\'x "$\\\n(ls)" | grep -n x',
    // printf that assigns a variable, and a glob as the program xargs runs
    'printf -v x %s y | grep -n x',
    "printf '%n' x | grep -n x",
    'echo x | xargs /bin/s? echo -n',
  ])('is false for %j', command => {
    expect(runsOnlyDataPrograms(command)).toBe(false)
  })
})
