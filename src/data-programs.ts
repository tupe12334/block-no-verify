// cspell:ignore fgrep egrep
/** Programs that only print or search their arguments and never run them. */
export const DATA_PROGRAMS = new Set([
  'echo',
  'printf',
  'cat',
  'tee',
  'grep',
  'egrep',
  'fgrep',
])
