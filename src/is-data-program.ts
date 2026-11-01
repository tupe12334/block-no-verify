// cspell:ignore egrep fgrep
/** Programs that only print, copy or search their arguments and never run them. */
const DATA_PROGRAMS = new Set([
  'echo',
  'printf',
  'cat',
  'tee',
  'grep',
  'egrep',
  'fgrep',
])

/**
 * Returns true when a program name only prints, copies or searches its
 * arguments, so none of its arguments is run as a command.
 * @param program - The program name, without any path prefix.
 * @returns True for a data program.
 */
export function isDataProgram(program: string): boolean {
  return DATA_PROGRAMS.has(program)
}
