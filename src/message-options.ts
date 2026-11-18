/**
 * Options whose value is prose for a human reader: a commit or tag message,
 * or a PR/issue/release title or body (`gh … --title/--body/--notes`). Their
 * value is never executed, so override-looking text in it is not a bypass.
 * Other short forms (`-b`, `-t`, `-n`) are left out on purpose: other
 * programs (`sudo -n`, `ssh -t`) give them different meanings.
 */
export const MESSAGE_OPTIONS = new Set([
  '-m',
  '--message',
  '--title',
  '--body',
  '--notes',
])
