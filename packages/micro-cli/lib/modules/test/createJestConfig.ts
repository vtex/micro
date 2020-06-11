export default function createJestConfig(
  resolve: (relativePath: string) => string,
  resolveAppPath: (relative: string) => string
) {
  const pkg = require(resolveAppPath('package.json'))

  // let setupFilesAfterEnv = [resolve('modules/jest/setup.js')]
  // if (pkg.jest && pkg.jest.setupFilesAfterEnv) {
  //   setupFilesAfterEnv = setupFilesAfterEnv.concat(pkg.jest.setupFilesAfterEnv)
  // }
  const coverageThreshold =
    pkg.jest && pkg.jest.coverageThreshold ? pkg.jest.coverageThreshold : {}

  const config = {
    rootDir: resolveAppPath('.'),
    // setupFilesAfterEnv,
    coverageThreshold,
    // moduleNameMapper: {
    //   '^.+\\.css$': require.resolve('identity-obj-proxy'),
    //   '^react$': require.resolve('react'),
    // },
    transform: {
      // '\\.(gql|graphql)$': require.resolve('jest-transform-graphql'),
      '^.+\\.(js|jsx|mjs|ts|tsx)$': resolve('babelTransform.js'),
      // '^(?!.*\\.(js|jsx|mjs|css|ts|tsx|json|graphql|gql)$)': resolve(
      //   'modules/jest/fileTransform.js'
      // ),
    },
  }

  return config
}
