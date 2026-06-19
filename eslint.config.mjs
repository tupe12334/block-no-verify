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
    },
  },
  {
    rules: {
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
]
