import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
  ...hmppsConfig({
    extraIgnorePaths: ['assets'],
    extraPathsAllowingDevDependencies: ['**/*.spec.ts', '**/*.page.ts', '**/playwright*.config.ts'],
  }),
  {
    rules: {
      'dot-notation': 'off',
      'import/prefer-default-export': 0,
      'no-await-in-loop': 0,
    },
  },
]
