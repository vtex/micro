import LoadablePlugin from '@loadable/webpack-plugin'
import TerserJSPlugin from 'terser-webpack-plugin'
import { Configuration } from 'webpack'
import {
  addPlugins,
  Block,
  customConfig,
  env,
  match,
  optimization,
} from 'webpack-blocks'

import { Project, WebpackBuildTarget } from '@vtex/micro-core'

import { babelConfig as moduleBabelConfig } from '../utils/babel/web'

export const getNodeConfig = async (
  _target: WebpackBuildTarget,
  _project: Project
): Promise<Array<Block | Configuration>> => {
  return [
    customConfig({
      externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        '@loadable/component': 'LoadableComponent',
      },
      externalsType: 'global',
    }),
    addPlugins([
      new LoadablePlugin({
        outputAsset: false,
        writeToDisk: false,
      }),
    ]),
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
    match(['*.tsx', '*.ts'], [moduleBabelConfig]),
  ]
}
