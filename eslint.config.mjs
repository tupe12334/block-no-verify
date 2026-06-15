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
]
