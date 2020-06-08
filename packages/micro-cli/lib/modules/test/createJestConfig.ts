export default function createJestConfig(
  resolve: (relativePath: string) => string,
  resolveAppPath: (relative: string) => string
) {
  const pkg = require(resolveAppPath('package.json'))

  let setupFilesAfterEnv = [resolve('afterEnvSetup.js')]
  const coverageThreshold =
    pkg.jest && pkg.jest.coverageThreshold ? pkg.jest.coverageThreshold : {}

  if (pkg.jest && pkg.jest.setupFilesAfterEnv) {
    setupFilesAfterEnv = setupFilesAfterEnv.concat(pkg.jest.setupFilesAfterEnv)
  }

  const config = {
    rootDir: resolveAppPath('.'),
    setupFilesAfterEnv,
    coverageThreshold,
    transform: {
      // '\\.(gql|graphql)$': require.resolve('jest-transform-graphql'),
      '^.+\\.(js|jsx|mjs|ts|tsx)$': resolve('babelTransform.js'),
      '^(?!.*\\.(js|jsx|mjs|css|ts|tsx|json|graphql|gql)$)': resolve(
        'fileTransform.js'
      ),
    },
  }

  return config
}
