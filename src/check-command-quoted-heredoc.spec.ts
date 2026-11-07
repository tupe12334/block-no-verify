import { describe, it, expect } from 'vitest'
import { checkCommand } from './check-command.js'

// Built at run time, so the skip flag never appears as literal text.
const NV = '--no-' + 'verify'

describe('checkCommand: a quoted heredoc body written to a file (#154)', () => {
  it.each([
    [
      'template literal with a call inside',
      "cat > run.mjs <<'EOF'\nconsole.log(`${r.stdout.trim()}`)\nEOF\nnode run.mjs",
    ],
    [
      'template literal fed through tee',
      'tee run.mjs <<\\EOF\nconst s = `${a.b()} ${c.d()}`\nEOF',
    ],
    [
      'shell parameter expansion text in a python file',
      'cat > run.py <<\'PY\'\nprint("${os.path.join(a, b)}")\nPY',
    ],
  ])('allows %s', (_name, command) => {
    const result = checkCommand(command, { toolName: 'Bash' })
    expect(result.blocked).toBe(false)
  })

  it('still blocks a bypass in a quoted body whose consumer may run it', () => {
    const result = checkCommand(
      `tee s.sh <<'EOF'\ngit commit -m x --allow-empty ${NV}\nEOF`,
      { toolName: 'Bash' }
    )
    expect(result.blocked).toBe(true)
  })

  it('still blocks a bypass next to expansion text in a quoted body', () => {
    const result = checkCommand(
      `tee s.sh <<'EOF'\ngit commit -m "\${x.y()}" ${NV}\nEOF`,
      { toolName: 'Bash' }
    )
    expect(result.blocked).toBe(true)
  })

  it('still blocks a hooks-path override in a quoted body', () => {
    const result = checkCommand(
      "tee s.sh <<'EOF'\ngit -c core.hooksPath=/dev/null commit -m x\nEOF",
      { toolName: 'Bash' }
    )
    expect(result.blocked).toBe(true)
  })

  it('still blocks a bypass in a quoted body piped to a shell', () => {
    const result = checkCommand(
      `cat <<'EOF' | bash\ngit push origin main ${NV}\nEOF`,
      { toolName: 'Bash' }
    )
    expect(result.blocked).toBe(true)
  })
})
