import type { parse } from 'shell-quote'

/** A single token from `shell-quote`'s parsed output. */
export type ParseToken = ReturnType<typeof parse>[number]
