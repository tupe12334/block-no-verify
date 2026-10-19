/** One `git <sub-command> <args…>` call found in a command line. */
export interface GitInvocation {
  /** The sub-command word, e.g. `commit`, or an alias name such as `ci`. */
  subcommand: string
  /** The argv words after the sub-command. */
  args: string[]
}
