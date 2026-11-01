import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// Built at run time, so the skip flag never appears as literal text.
const NV = '--no-' + 'verify'
const N = '-' + 'n'
const M = 'git commit -m x --allow-empty'
const BODY = `${M} ${NV}`
const BT = `\`${BODY}\``

describe('checkCommand: text that a shell later runs is blocked', () => {
  it.each([
    ['heredoc piped to bash', `cat <<\\EOF | bash\n${BODY}\nEOF`],
    ['heredoc to env bash', `env bash <<\\EOF\n${BODY}\nEOF`],
    ['heredoc to source /dev/stdin', `source /dev/stdin <<\\EOF\n${BODY}\nEOF`],
    ['heredoc to bash -s -- -c', `bash -s -- -c <<\\EOF\n${BODY}\nEOF`],
    ['tee then sh', `tee s.sh <<\\EOF; sh s.sh\n${BODY}\nEOF`],
    ['cat to file then bash', `cat > s.sh <<\\EOF\n${BODY}\nEOF\nbash s.sh`],
    ['eval of a substitution heredoc', `eval "$(cat <<\\EOF\n${BODY}\nEOF\n)"`],
    ['backtick in single quotes to bash -c', `bash -c 'echo ${BT}'`],
    ['backtick in single quotes to eval', `eval 'x=${BT}'`],
    ['single quoted echo piped to bash', `echo 'x=${BT}' | bash`],
    ['source here-string', `source /dev/stdin <<< 'echo ${BT}'`],
    ['here-string to bash', `bash <<< 'echo ${BT}'`],
    ['escaped backtick to bash -c', `bash -c "echo \\${BT}"`],
    ['escaped dollar-paren to bash -c', `bash -c "echo \\$(${BODY})"`],
    ['echo with $# before a quote and a newline', `echo $#'\n${BT}'`],
  ])('blocks %s', (_name, command) => {
    expect(checkCommand(command).blocked).toBe(true)
  })

  it('still blocks the plain substitution', () => {
    expect(checkCommand(`echo "$(${BODY})"`).blocked).toBe(true)
  })
})
