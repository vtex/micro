import LoadablePlugin from '@loadable/webpack-plugin'
import {
  BundlePlugin,
  BundleTarget,
  pagesFrameworkName,
  pagesRuntimeName,
  Project
} from '@vtex/micro-core/lib'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import { basename } from 'path'
import PnpPlugin from 'pnp-webpack-plugin'
import TerserJSPlugin from 'terser-webpack-plugin'
import TimeFixPlugin from 'time-fix-plugin'
import {
  addPlugins,
  Block,
  Context,
  customConfig,
  defineConstants,
  entryPoint,
  env,
  group,
  match,
  optimization,
  performance,
  resolve,
  setContext,
  setMode,
  sourceMaps
} from 'webpack-blocks'
import DynamicPublicPathPlugin from 'webpack-dynamic-public-path'

import { externalPublicPathVariable } from '../../components/publicPaths'
import { aliases } from '../aliases'
import { cacheGroup } from './modules/cacheGroups'
import { webnewBabel } from './webnew'
import { weboldBabel } from './webold'

const entriesFromPages = async (project: Project) => {
  const files = await project.root.getFiles('pages')
  return files.reduce(
    (acc, path) => {
      if (path.endsWith('.tsx')) {
        const name = basename(path, '.tsx')
        acc[name] = path.replace(project.rootPath, '.')
      }
      return acc
    },
  {} as Record<string, string>
  )
}

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (config: Block<Context>, target: BundleTarget): Promise<Block<Context>> => {
    const entrypoints = await entriesFromPages(this.project)
    const block: Block<Context>[] = [
      setMode(this.mode),
      setContext(this.project.rootPath),
      entryPoint(entrypoints),
      defineConstants({
        'process.env.NODE_ENV': this.mode
      }),
      addPlugins([
        new LoadablePlugin({
          outputAsset: false,
          writeToDisk: false
        }),
        new DynamicPublicPathPlugin({
          externalPublicPath: externalPublicPathVariable
        })
      ]),
      resolve({
        alias: aliases.reduce(
          (acc, packageName) => {
            acc[packageName] = require.resolve(packageName)
            return acc
          },
          {} as Record<string, string>
        ),
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
        plugins: [
          PnpPlugin
        ]
      }),
      cacheGroup(pagesRuntimeName, /\/react\/|\/react-dom\/|\/@loadable\//),
      cacheGroup(pagesFrameworkName, /\/micro-react\/components\//),
      optimization({
        runtimeChunk: {
          name: 'webpack-runtime'
        },
        splitChunks: {
          maxInitialRequests: 30,
          maxAsyncRequests: 10
        }
      } as any),
      customConfig({
        name: target,
        target: 'web',
        bail: true,
        node: false,
        profile: true,
        resolveLoader: {
          plugins: [
            PnpPlugin.moduleLoader(module)
          ]
        }
      }) as Block<Context>,
      env('production', [
        optimization({
          noEmitOnErrors: true,
          namedModules: false,
          namedChunks: false,
          moduleIds: 'size',
          chunkIds: 'total-size',
          nodeEnv: 'production',
          removeAvailableModules: true,
          removeEmptyChunks: true,
          mergeDuplicateChunks: true,
          flagIncludedChunks: true,
          occurrenceOrder: true,
          providedExports: true,
          usedExports: true,
          concatenateModules: true,
          sideEffects: true,
          portableRecords: false,
          minimizer: [
            new TerserJSPlugin({
              extractComments: true
            }),
            new OptimizeCSSAssetsPlugin({
              cssProcessorPluginOptions: {
                preset: ['default', { discardComments: { removeAll: true } }]
              }
            })
          ]
        } as any),
        performance({
          hints: 'warning'
        })
      ]),
      env('development', [
        addPlugins([
          new TimeFixPlugin()
        ]),
        sourceMaps('inline-source-map'),
        customConfig({
          watchOptions: {
            ignored: `${this.project.dist}`,
            aggregateTimeout: 300
          }
        }) as Block<Context>
      ])
    ]

    return group([
      config,
      ...block,
      match(['*.tsx', '*.ts'], [target === 'webnew' ? webnewBabel : weboldBabel])
    ])
  }
}
