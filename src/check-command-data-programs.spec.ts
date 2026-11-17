import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// When no statement runs git, every statement is scanned for a flag. Git text
// that only `echo` prints and `grep` reads runs nowhere, so the `-n` of those
// programs is theirs.
describe('checkCommand: git text that only data programs handle', () => {
  it.each([
    'echo "git commit -m x" | grep -n commit',
    'echo "git commit -m x" | cat -n',
    `printf '%s\\n' "git commit -m x" | grep -n commit`,
    'echo "git commit -m x" > notes.txt && grep -n commit notes.txt',
    'echo "git commit -m x" | xargs -n 1 echo',
    'grep -n "git commit" README.md',
    'echo -n "git commit -m x" | grep commit',
  ])('allows %j', command => {
    expect(checkCommand(command).blocked).toBe(false)
  })

  // Each of these runs, or may run, git with the flag.
  it.each([
    'git commit -n -m x',
    `echo 'git commit "$@"' | bash -s -- -n -m x`,
    `echo 'git commit "$@"' > s.sh && bash s.sh -n -m x`,
    'f() { eval "git commit $*"; }; f -n -m x',
    'grep() ( eval "git commit $*" ); grep -n -m x',
    `echo 'git commit "$@"' > s.sh\ngrep -n x f\nbash s.sh -n -m x`,
    '$(echo "git commit") -n -m x',
    `bash -c 'echo "x;git commit -n -m y" | grep -n .' | sh`,
    `echo "git commit" | xargs -n 9 sh -c '"$0" "$@" -n -m x'`,
    `echo "git commit" | xargs -n 9 -J echo sh -c '"$0" "$@" -n -m x'`,
    `echo "git commit" | xargs -n 9 --process-slot-var echo sh -c '"$0" "$@" -n -m x'`,
    `echo 'git commit "$@"' > grep; /bin/?ash grep -n -m x`,
    `echo 'git commit "$@"' > d/grep; PATH=d:$PATH grep -n -m x`,
    `echo 'git commit "$@"' | tee s.sh | grep -n x; sh s.sh -n -m x`,
    // bash evaluates the array subscript, running the quoted substitution
    "printf -v 'a[$(git commit -n -m y)]' x | grep -n x",
  ])('blocks %j', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  // The tokenizer drops expansions and continuations that bash or zsh reads,
  // so these look like data-only lines to it but run git with the flag.
  it.each([
    '${0+git}${IFS}${0+commit}${IFS}${0+-m}${IFS}echo -n; echo "git commit"',
    "echo ${C:=git}; echo ' C=echo git commit'; $C commit -n -m x",
    `echo so; "$_"cat -n - EXEC:'git commit -n -m y'`,
    'echo -n "${(e):-\\$(git commit -n -m x)}"',
    "echo $\\\n'\\'' \"$(git commit -n -m x)\" $\\\n'\\'' -n",
    'echo \\\' "$\\\n(git commit -n -m x)" -n',
    // printf -v and zsh %n assign a variable, even a command table entry
    `printf -v 'functions[grep]' 'git commit "$@"'; grep -n -m x`,
    "printf '%n' 'a[$(git commit -n -m x)]'; echo -n",
    // a glob can name the program xargs runs
    `echo 'git commit "$@"' > echo; echo x | xargs /bin/s? echo -n -m`,
  ])('blocks %j', command => {
    expect(checkCommand(command).blocked).toBe(true)
  })
})
