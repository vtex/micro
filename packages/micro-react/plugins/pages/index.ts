import LoadablePlugin from '@loadable/webpack-plugin'
import {
  mergeConfigs,
  PagesBuilderPlugin,
  PagesConfigOptions,
  pagesFrameworkName,
  pagesRuntimeName,
  Platform,
  Platforms
} from '@vtex/micro'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import TerserJSPlugin from 'terser-webpack-plugin'
import { Configuration } from 'webpack'

export class PagesBuilder extends PagesBuilderPlugin {
  public getConfig = ({ mode, configs }: PagesConfigOptions) => {
    const baseConfig: Configuration = {
      plugins: [
        new LoadablePlugin({
          outputAsset: false,
          writeToDisk: false
        })
      ],
      stats: {
        hash: true,
        publicPath: true,
        assets: true,
        chunks: false,
        modules: false,
        source: false,
        errorDetails: false,
        timings: false
      }
    }

    const baseOptimization = mode === 'production'
      ? {
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
      } : undefined

    const configByPlatform = {
      [Platforms.nodejs]: {
        ...baseConfig,
        name: Platforms.nodejs,
        optimization: baseOptimization
      },
      [Platforms.webnew]: {
        ...baseConfig,
        name: Platforms.webnew,
        optimization: {
          ...baseOptimization,
          ...webOptimization(configs.webnew)
        }
      },
      [Platforms.webold]: {
        ...baseConfig,
        name: Platforms.webold,
        optimization: {
          ...baseOptimization,
          ...webOptimization(configs.webnew)
        }
      }
    } as Record<Platform, Configuration>

    return mergeConfigs(configs, configByPlatform)
  }
}

const mergeRegex = (r1: RegExp, r2: RegExp | undefined): RegExp => {
  if (!r2) {
    return r1
  }
  return new RegExp(r1.source + '|' + r2.source)
}

const isRegExp = (a: any): a is RegExp => typeof a.exec === 'function'

const getRegexFromCacheGroup = (name: string, optimization: Configuration['optimization']) => {
  if (
    !optimization ||
    !optimization.splitChunks ||
    !optimization.splitChunks.cacheGroups ||
    typeof optimization.splitChunks.cacheGroups === 'string' ||
    typeof optimization.splitChunks.cacheGroups === 'function' ||
    isRegExp(optimization.splitChunks.cacheGroups)
  ) {
    return
  }
  const cacheGroup = optimization.splitChunks.cacheGroups[name]
  if (!cacheGroup) {
    return
  }
  if (isRegExp(cacheGroup.test)) {
    return cacheGroup.test
  }
}

const webOptimization = ({ optimization }: Configuration): Configuration['optimization'] => ({
  splitChunks: {
    cacheGroups: {
      [pagesRuntimeName]: {
        test: mergeRegex(/react$|react-dom$|@loadable/, getRegexFromCacheGroup(pagesRuntimeName, optimization)),
        reuseExistingChunk: true,
        name: pagesRuntimeName,
        chunks: 'all',
        enforce: true
      },
      [pagesFrameworkName]: {
        test: mergeRegex(/@micro-react$/, getRegexFromCacheGroup(pagesFrameworkName, optimization)),
        reuseExistingChunk: true,
        name: pagesFrameworkName,
        chunks: 'all',
        enforce: true
      }
    }
  }
})
