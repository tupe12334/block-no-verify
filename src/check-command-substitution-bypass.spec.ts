import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

const NV = '--no-' + 'verify'
const N = '-' + 'n'

describe('checkCommand: bypasses that run git inside substitutions, heredocs and comments', () => {
  describe('still blocks', () => {
    it.each([
      // Backtick spans that shell-quote splits into several words.
      `echo \`git commit -m x ${NV}\``,
      `X=\`git commit -m x ${NV}\``,
      `command -v \`git commit -m x --allow-empty ${N}\``,
      `echo \`echo \\\`git commit -m x --allow-empty ${N}\\\`\``,
      `cat <<EOF\n\`git commit -m x --allow-empty ${N}\`\nEOF`,
      // A substitution inside double quotes, with a quote or paren in it.
      `echo "\${x:-'$(git commit -m x --allow-empty ${NV})'}"`,
      `echo "$(printf ')'; git commit -n -m x)"`,
      // A comment ends at its newline, and its apostrophe is not a quote.
      `echo ok # it's\nx=$(git commit -m x ${N})`,
      `: # don't\necho $(git commit -m x ${NV})`,
      `echo hi # note\ngit commit -m x --allow-empty ${NV}`,
      `echo foo#bar; git commit ${N} -m x`,
      // A heredoc piped into a shell, or fed to an interpreter.
      `cat <<EOF | bash\ngit commit -m x ${NV}\nEOF`,
      `cat <<E.F | bash\ngit commit -m x ${NV}\nE.F`,
      `<<EOF bash\ngit commit -n -m x\nEOF`,
      `cat <<EOF | bash\ngit commit \\\n${NV} -m x\nEOF`,
      `python3 <<\\EOF\nimport os; os.system("git commit -m x ${NV}")\nEOF`,
      `osascript -e 'do shell script "git commit -m x --allow-empty ${N}"'`,
      // A shell command given to trap, or here-string text that read stores.
      `trap 'git commit -m x --allow-empty ${N}' EXIT`,
      `read -r X <<< 'git commit -m x ${N}'; $X`,
      // Text that a substitution or process substitution prints and a shell runs.
      `eval "$(printf 'git commit -m x ${NV}')"`,
      `bash -c "$(echo 'git commit -m x ${NV}')"`,
      `sh <(echo 'git commit -m x ${NV}')`,
      `$(printf '%s' 'git commit -m x --allow-empty ${N}')`,
      // A substitution that runs git between the arguments of another command.
      `git commit -m x > $(echo f) ${NV}`,
      `git commit -m x > >(cat) ${NV}`,
      // A hooks path override with a redirection before its key.
      'git -c > f core.hooksPath=/dev/null commit -m x',
    ])('%s', command => {
      expect(checkCommand(command).blocked).toBe(true)
    })
  })

  describe('allows', () => {
    it.each([
      'git commit -m "fix a # b"',
      'git commit -m "x" # --no-verify in a comment',
      'echo "$(date)" && git commit -m "msg"',
      'echo `date` && git commit -m "msg"',
      "echo 'git commit -m x --no-verify'",
      "cat <<'EOF'\ngit commit -m x --no-verify\nEOF",
      'echo "#" && git commit -m "msg"',
    ])('%s', command => {
      expect(checkCommand(command).blocked).toBe(false)
    })
  })
})
