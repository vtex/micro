import { basename } from 'path'
import PnpPlugin from 'pnp-webpack-plugin'
import TimeFixPlugin from 'time-fix-plugin'
import { Configuration, DefinePlugin } from 'webpack'
import DynamicPublicPathPlugin from 'webpack-dynamic-public-path'

import {
  externalPublicPathVariable,
  OnAssemblePlugin,
  OnAssembleConfigOptions,
  pagesFrameworkName,
  pagesRuntimeName,
  Platform,
  Platforms
} from '../../framework/lifecycle/onAssemble'
import { Project } from '../../framework/project'

const entriesFromPages = (project: Project) => project.root.getFiles('pages').reduce(
  (acc, path) => {
    const name = basename(path, '.tsx')
    acc[name] = path.replace(project.root.path, './')
    return acc
  },
  {} as Record<string, string>
)

export class OnAssemble extends OnAssemblePlugin {
  public getConfig = ({ project, mode, configs }: OnAssembleConfigOptions) => {
    const baseConfig: Configuration = {
      mode,
      bail: true,
      node: false,
      profile: true,
      context: project.root.path,
      entry: entriesFromPages(project),
      devtool: mode === 'development' ? 'inline-source-map' : undefined,
      watchOptions: mode === 'development' ? {
        ignored: `${project.dist}`,
        aggregateTimeout: 300
      } : undefined,
      resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        plugins: [
          PnpPlugin
        ]
      },
      resolveLoader: {
        plugins: [
          PnpPlugin.moduleLoader(module)
        ]
      },
      plugins: [
        new DefinePlugin({
          'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
        })
      ]
    }

    if (mode === 'development') {
      baseConfig.plugins!.push(new TimeFixPlugin())
    }

    return {
      [Platforms.nodejs]: {
        ...configs.nodejs,
        ...baseConfig,
        name: Platforms.nodejs,
        target: 'node'
      },
      [Platforms.webnew]: {
        ...configs.webnew,
        ...baseConfig,
        name: Platforms.webnew,
        target: 'web',
        optimization: mode === 'production' ? webOptimizations() : undefined,
        plugins: [
          ...configs.nodejs.plugins || [],
          ...baseConfig.plugins || [],
          ...webPlugins()
        ]
      },
      [Platforms.webold]: {
        ...configs.webold,
        ...baseConfig,
        name: Platforms.webold,
        target: 'web',
        optimization: mode === 'production' ? webOptimizations() : undefined,
        plugins: [
          ...configs.nodejs.plugins || [],
          ...baseConfig.plugins || [],
          ...webPlugins()
        ]
      }
    } as Record<Platform, Configuration>
  }
}

const webPlugins = () => {
  return [
    new DynamicPublicPathPlugin({
      externalPublicPath: externalPublicPathVariable
    })
  ]
}

const webOptimizations = () => ({
  runtimeChunk: {
    name: pagesRuntimeName
  },
  splitChunks: {
    maxInitialRequests: 30,
    maxAsyncRequests: 10,
    cacheGroups: {
      [pagesFrameworkName]: {
        test: /@micro$/,
        reuseExistingChunk: true,
        name: pagesFrameworkName,
        chunks: 'all',
        enforce: true
      }
    }
  },
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
  portableRecords: false
})
