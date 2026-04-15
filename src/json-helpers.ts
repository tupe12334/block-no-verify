/**
 * Type-safe property check
 */
export function hasProperty(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}
