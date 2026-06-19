import agentConfig from 'eslint-config-agent'
import publishablePackageJson from 'eslint-config-publishable-package-json'

export default [
  ...agentConfig,
  publishablePackageJson,
  {
    ignores: ['dist/**', '**/node_modules/**', '*.config.js', '*.config.mjs', 'tmp-*/', '**/.claude/**'],
  },
  {
    files: ['src/**/*.spec.ts', 'vitest.config.ts'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: './tsconfig.test.json',
      },
    },
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      // Disallow reassigning function parameters to avoid confusing
      // input/local dual-use and the subtle bugs it can mask.
      'no-param-reassign': 'error',
    },
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      // Mirror consistent-type-imports on the export side: type-only
      // re-exports must use `export type`. This lets bundlers/transpilers
      // fully elide them from the runtime graph, preventing accidental
      // runtime imports of type-only modules and the circular-import
      // runtime errors that follow, while keeping the package's public
      // value vs. type surface explicit.
      '@typescript-eslint/consistent-type-exports': 'error',
    },
  },
  {
    rules: {
      // Require every union/enum member to be handled in a switch (or a
      // default clause). Turns a forgotten case for a newly added variant
      // into a lint error instead of a silent runtime fall-through.
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      // Forbid relying on implicit truthiness of nullable strings/numbers/objects
      // in conditions. Forces explicit checks (e.g. `s.length > 0`, `x != null`)
      // so an empty string, 0, or NaN can't silently take the wrong branch.
      '@typescript-eslint/strict-boolean-expressions': 'error',
      // Ban the non-null assertion operator (`!`): it silently erases a real
      // null-safety guarantee and turns a compile-time-catchable bug into a
      // runtime TypeError. Force an explicit check, early return, or type guard.
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    rules: {
      // Require strict equality (`===`/`!==`) everywhere. Loose equality
      // performs implicit type coercion with surprising results (`0 == ''`,
      // `null == undefined`, `[] == false`), masking bugs that strict
      // comparison would surface. The TypeScript-ESLint presets do not cover
      // this, so enable the core rule explicitly.
      eqeqeq: ['error', 'always'],
    },
  },
  {
    rules: {
      // Require explicit parameter and return types on exported (module
      // boundary) functions. For a published package the inferred public API
      // surface can silently drift when an implementation detail changes; an
      // explicit annotation pins the contract so a refactor that widens or
      // narrows a return type fails review instead of leaking to consumers.
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
  {
    rules: {
      // Force function-typed members of interfaces/type literals to be written
      // as property signatures (`f: (x: X) => Y`) instead of method shorthand
      // (`f(x: X): Y`). Method shorthand is type-checked bivariantly, so an
      // implementation with narrower parameter types silently satisfies the
      // interface and lets an incompatible argument slip through; the property
      // form is checked contravariantly (strictly), restoring sound parameter
      // checking. This matters for a published package whose interfaces
      // (e.g. `HookSdk`, `Manager`) are part of the exported type surface.
      '@typescript-eslint/method-signature-style': ['error', 'property'],
    },
  },
  {
    rules: {
      // Require any function that returns a Promise to be declared `async`.
      // Without this, a sync-looking function can return a promise, so a
      // synchronous `throw` inside it surfaces as a thrown exception at the
      // call site instead of a rejected promise — two different error paths
      // for one function. Forcing `async` unifies the contract: the function
      // always returns a promise and always rejects (never throws), so callers
      // can rely on a single `try/await` or `.catch` path.
      '@typescript-eslint/promise-function-async': 'error',
    },
  },
  {
    rules: {
      // Disallow a variable declaration in an inner scope from shadowing one
      // in an outer scope. Shadowing silently detaches a reference from the
      // outer binding the reader expects (e.g. a local `resolve` callback
      // hiding the imported `path.resolve`), so a typo or refactor reads/writes
      // the wrong variable with no error. The core `no-shadow` is disabled and
      // replaced by the TS-aware variant, which understands type-vs-value space
      // (so type names don't falsely collide with values).
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
    },
  },
  {
    rules: {
      // Disallow an `else`/`else if` block when the preceding `if` block ends
      // in a `return`. The else is dead structure: its body already only runs
      // when the `if` did not return, so unindenting it is behaviourally
      // identical while flattening one level of nesting. Enforcing the guard-
      // clause shape keeps branch logic linear and easier to follow, and stops
      // needless arrow-of-nesting growth as new conditions are added.
      'no-else-return': ['error', { allowElseIf: false }],
    },
  },
  {
    rules: {
      // Require template literals instead of string concatenation (`a + b`).
      // String `+` silently coerces every non-string operand via `toString`,
      // so a number, `null`/`undefined`, or an object slips into the result as
      // `"undefined"` or `"[object Object]"` with no error — a class of bug
      // that is easy to introduce and hard to spot in review. Template literals
      // make the interpolation points explicit and keep multi-part strings
      // readable, removing both the coercion footgun and the `+`-soup it grows
      // into as more fragments are appended.
      'prefer-template': 'error',
    },
  },
]
