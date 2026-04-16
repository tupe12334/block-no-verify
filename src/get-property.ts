/**
 * Type-safe property access using Object.entries
 */
export function getProperty(obj: object, key: string): unknown {
  const entries = Object.entries(obj)
  for (const entry of entries) {
    if (entry[0] === key) {
      return entry[1]
    }
  }
  return undefined
}
