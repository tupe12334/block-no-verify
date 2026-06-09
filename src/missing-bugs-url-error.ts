/**
 * Thrown when the project's package.json has no bugs.url entry, so the block
 * message cannot point the agent at an issue tracker.
 */
export class MissingBugsUrlError extends Error {
  constructor() {
    super('package.json is missing a bugs.url entry')
    this.name = 'MissingBugsUrlError'
  }
}
