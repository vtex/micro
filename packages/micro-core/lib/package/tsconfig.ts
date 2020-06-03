import { MICRO_BUILD_DIR } from '../constants'
import { lifecycle } from '../lifecycles/build'

export const BaseTSConfig = {
  compilerOptions: {
    typeRoots: [
      'lib/typings',
      'router/typings',
      'plugins/typings',
      'components/typings',
    ],
    target: 'es2019',
    module: 'commonjs',
    moduleResolution: 'node',
    outDir: `${MICRO_BUILD_DIR}/${lifecycle}/cjs`,
    jsx: 'preserve',
    strict: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: false,
    skipLibCheck: true,
    declaration: true,
  },
  include: ['index.ts', 'lib', 'router', 'plugins', 'components'],
  exclude: [MICRO_BUILD_DIR, 'pages'],
}

export type TSConfig = typeof BaseTSConfig

// TODO: Maybe implement a deep merge in here with priority to BaseTSConfig
export const genTSConfig = (partial: any): TSConfig => {
  return {
    ...partial,
    ...BaseTSConfig,
    compilerOptions: {
      ...partial?.compilerOptions,
      ...BaseTSConfig.compilerOptions,
    },
  }
}
