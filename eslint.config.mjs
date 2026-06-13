import agentConfig from 'eslint-config-agent'
import publishablePackageJson from 'eslint-config-publishable-package-json'

export default [
  ...agentConfig,
  publishablePackageJson,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.claude/**',
      '*.config.js',
      '*.config.mjs',
      'tmp-*/',
    ],
  },
]
