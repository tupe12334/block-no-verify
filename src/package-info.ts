/**
 * Canonical "open a new issue" URL, shown in the block message.
 *
 * A literal, not read from package.json: the package ships as ESM and CommonJS,
 * and `import.meta.url` (used before for this) is rejected by the CommonJS build.
 * package-info.spec.ts asserts this matches package.json `bugs.url`.
 */
// eslint-disable-next-line default/no-hardcoded-urls -- canonical issue tracker, kept in sync with package.json by package-info.spec.ts
const ISSUES_NEW_URL = 'https://github.com/tupe12334/block-no-verify/issues/new'

/**
 * @returns The "open a new issue" URL for the project repository.
 */
export function issuesUrl(): string {
  return ISSUES_NEW_URL
}
