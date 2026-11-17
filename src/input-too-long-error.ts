/**
 * Thrown when a text grows too long to check in bounded time. The caller
 * blocks the command instead of allowing it.
 */
export class InputTooLongError extends Error {
  constructor() {
    super('command text is too long to check')
    this.name = 'InputTooLongError'
  }
}
