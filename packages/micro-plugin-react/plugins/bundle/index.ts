import LoadablePlugin from '@loadable/webpack-plugin'
import TerserJSPlugin from 'terser-webpack-plugin'
import { Configuration } from 'webpack'
import {
  addPlugins,
  Block,
  entryPoint,
  env,
  group,
  match,
  optimization,
  resolve,
} from 'webpack-blocks'

import {
  BundlePlugin,
  BundleTarget,
  entriesFromProject,
  pagesFrameworkName,
  pagesRuntimeName,
  sharedDepsFromProject,
} from '@vtex/micro-core'

import { babelConfig as moduleBabelConfig } from '../utils/babel/web'
import { babelConfig as legacyBabelConfig } from '../utils/babel/web-legacy'
import { cacheGroup } from '../utils/cacheGroups'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (
    config: Block,
    target: BundleTarget
  ): Promise<Block> => {
    const entrypoints = await entriesFromProject(this.project)

    const block: Array<Block | Configuration> = [
      entryPoint(entrypoints),
      addPlugins([
        new LoadablePlugin({
          outputAsset: false,
          writeToDisk: false,
        }),
      ]),
      resolve({
        alias: sharedDepsFromProject(this.project),
      }),
      cacheGroup(pagesRuntimeName, /\/react\/|\/react-dom\/|\/@loadable\//),
      cacheGroup(pagesFrameworkName, /\/micro-react\/components\//),
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

    return group([config, ...(block as any)])
  }
}
