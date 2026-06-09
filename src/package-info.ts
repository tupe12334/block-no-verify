import { readFileSync } from 'node:fs'
import { MissingBugsUrlError } from './missing-bugs-url-error.js'

/**
 * Reads the project's bug tracker URL from the root package.json so the block
 * message points at the canonical issue tracker without duplicating the URL.
 *
 * Resolved relative to this module: at runtime the compiled file lives in
 * dist/, and under tests it lives in src/ — in both cases ../package.json
 * resolves to the package root.
 *
 * @returns The "open a new issue" URL for the project repository.
 * @throws MissingBugsUrlError when package.json has no usable bugs.url.
 */
export function issuesUrl(): string {
  const pkgUrl = new URL('../package.json', import.meta.url)
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- path derived from this module's own location, never from user input
  const pkg: unknown = JSON.parse(readFileSync(pkgUrl, 'utf8'))

  if (typeof pkg === 'object' && pkg !== null && 'bugs' in pkg) {
    const bugs = pkg.bugs
    if (typeof bugs === 'object' && bugs !== null && 'url' in bugs) {
      const url = bugs.url
      if (typeof url === 'string' && url !== '') {
        return `${url}/new`
      }
    }
  }

  throw new MissingBugsUrlError()
}
