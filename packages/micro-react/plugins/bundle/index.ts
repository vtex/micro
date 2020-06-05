import { basename } from 'path'

import LoadablePlugin from '@loadable/webpack-plugin'
import PnpPlugin from 'pnp-webpack-plugin'
import TerserJSPlugin from 'terser-webpack-plugin'
import {
  addPlugins,
  Block,
  customConfig,
  entryPoint,
  env,
  group,
  match,
  optimization,
  performance,
  resolve,
} from 'webpack-blocks'

import {
  BundlePlugin,
  BundleTarget,
  pagesFrameworkName,
  pagesRuntimeName,
  Project,
} from '@vtex/micro-core/lib'

import { aliases } from '../aliases'
import { cacheGroup } from './modules/cacheGroups'
import { webnewBabel } from './webnew'
import { weboldBabel } from './webold'

const entriesFromPages = async (project: Project) => {
  const files = await project.root.getFiles('pages')
  return files.reduce((acc, path) => {
    if (path.endsWith('.tsx')) {
      const name = basename(path, '.tsx')
      acc[name] = path.replace(project.rootPath, '.')
    }
    return acc
  }, {} as Record<string, string>)
}

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (
    config: Block,
    target: BundleTarget
  ): Promise<Block> => {
    const entrypoints = await entriesFromPages(this.project)
    const block: Block[] = [
      entryPoint(entrypoints),
      addPlugins([
        new LoadablePlugin({
          outputAsset: false,
          writeToDisk: false,
        }),
      ]),
      resolve({
        alias: aliases.reduce((acc, packageName) => {
          acc[packageName] = require.resolve(packageName)
          return acc
        }, {} as Record<string, string>),
        plugins: [PnpPlugin],
      }),
      cacheGroup(pagesRuntimeName, /\/react\/|\/react-dom\/|\/@loadable\//),
      cacheGroup(pagesFrameworkName, /\/micro-react\/components\//),
      optimization({
        splitChunks: {
          maxInitialRequests: 30,
          maxAsyncRequests: 10,
        },
      } as any),
      customConfig({
        name: target,
        target: 'web',
        bail: true,
        node: false,
        profile: true,
        resolveLoader: {
          plugins: [PnpPlugin.moduleLoader(module)],
        },
      }) as Block,
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
        performance({
          hints: 'warning',
        }),
      ]),
    ]

    return group([
      config,
      ...block,
      match(
        ['*.tsx', '*.ts'],
        [target === 'webnew' ? webnewBabel : weboldBabel]
      ),
    ])
  }
}
