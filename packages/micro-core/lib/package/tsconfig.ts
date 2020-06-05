import { concat, mergeDeepWith, uniq } from 'ramda'

import { MICRO_BUILD_DIR } from '../constants'
import { BUILD_LIFECYCLE } from '../lifecycles/build'

export const BaseTSConfig = {
  compilerOptions: {
    types: ['node'],
    typeRoots: ['lib/typings', 'plugins/typings', 'components/typings'],
    target: 'es2019',
    module: 'commonjs',
    moduleResolution: 'node',
    outDir: `${MICRO_BUILD_DIR}/${BUILD_LIFECYCLE}/cjs`,
    jsx: 'preserve',
    esModuleInterop: true,
    forceConsistentCasingInFileNames: false,
    skipLibCheck: true,
    declaration: true,
    strict: true,
  },
  exclude: [MICRO_BUILD_DIR],
}

export type TSConfig = typeof BaseTSConfig

export const mergeTSConfig = (a: any, b: any) =>
  mergeDeepWith(
    (c: any, d: any) => {
      if (Array.isArray(c) && Array.isArray(d)) {
        return uniq(concat(c, d))
      }
      return d
    },
    a,
    b
  )

export const genTSConfig = (original: any) =>
  mergeTSConfig(original, BaseTSConfig)
