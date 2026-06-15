/**
 * A single shell token: a `word` (one argument, with quoting resolved) or an
 * `op` (an unquoted shell control operator that bounds a command).
 */
export interface Token {
  type: 'word' | 'op'
  value: string
}
