// cspell:ignore Skeyn keyn
/**
 * Short options of `git commit` that take a value, taken from the usage
 * output of `git commit -h` (git 2.50.1).
 *
 * Only `commit` needs this table. `-n` is `--no-verify` for `git commit`
 * alone; for push, merge, cherry-pick, rebase and am it means something
 * else, so those are not scanned for a short bundle.
 *
 * - `required`: letters that take a required value. In a bundle, git reads the
 *   rest of the token as the value (`-tn` is `--template=n`), or the next
 *   token when the letter ends the bundle: `-m`, `-F`, `-C`, `-c`, `-t`.
 * - `optionalInline`: letters whose value is optional and must be attached:
 *   `-u[<mode>]` and `-S[<key-id>]`. The rest of the bundle is the value, so
 *   `-uno` is `--untracked-files=no` and `-Skeyn` is `--gpg-sign=keyn`. A
 *   separate token after them is never their value.
 */
export const COMMIT_SHORT_VALUE_OPTIONS = {
  required: new Set(['m', 'F', 'C', 'c', 't']),
  optionalInline: new Set(['u', 'S']),
}
