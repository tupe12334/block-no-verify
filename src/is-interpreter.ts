/** Matches an interpreter name: python3.12, perl, ruby, node, bun, deno, php, lua. */
const INTERPRETER = /^(?:python[\d.]*|perl|ruby|node|nodejs|bun|deno|php|lua)$/

/**
 * Tells whether a program name is a code interpreter whose string literals
 * can hold a command (`python3`, `perl`, `node`, …).
 * @param name - A program base name.
 * @returns True for an interpreter.
 */
export function isInterpreter(name: string): boolean {
  return INTERPRETER.test(name)
}
