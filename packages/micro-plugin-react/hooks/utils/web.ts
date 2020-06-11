import LoadablePlugin from '@loadable/webpack-plugin'
import TerserJSPlugin from 'terser-webpack-plugin'
import { Configuration } from 'webpack'
import { addPlugins, Block, env, match, optimization } from 'webpack-blocks'

import {
  alias,
  cacheGroup,
  pagesFrameworkName,
  pagesRuntimeName,
  Project,
} from '@vtex/micro-core'

import { aliases } from '../alias'
import { babelConfig as moduleBabelConfig } from './babel/web'
import { babelConfig as legacyBabelConfig } from './babel/web-legacy'

export const getWebConfig = async (
  _project: Project,
  target: 'web' | 'web-legacy'
): Promise<Array<Block | Configuration>> => {
  return [
    alias(aliases, module),
    addPlugins([
      new LoadablePlugin({
        outputAsset: false,
        writeToDisk: false,
      }),
    ]),
    cacheGroup(pagesRuntimeName, /\/react\/|\/react-dom\/|\/@loadable\//),
    cacheGroup(pagesFrameworkName, /\/micro-plugin-*/),
    optimization({
      splitChunks: {
        maxInitialRequests: 30,
        maxAsyncRequests: 10,
      },
    } as any),
    env('production', [
      optimization({
        noEmitOnErrors: true,
        moduleIds: 'size',
        chunkIds: 'total-size',
        nodeEnv: 'production',
        removeAvailableModules: true,
        removeEmptyChunks: true,
        mergeDuplicateChunks: true,
        flagIncludedChunks: true,
        providedExports: true,
        usedExports: true,
        concatenateModules: true,
        sideEffects: true,
        portableRecords: false,
        minimizer: [
          new TerserJSPlugin({
            extractComments: true,
          }),
        ],
      } as any),
    ]),
    match(
      ['*.tsx', '*.ts'],
      [target === 'web' ? moduleBabelConfig : legacyBabelConfig]
    ),
  ]
}
