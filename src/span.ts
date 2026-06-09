/**
 * A consumed span of a command string: the unquoted text it yields and the
 * index in the original string immediately after it.
 */
export interface Span {
  value: string
  next: number
}
