import { basename, join } from 'path'
import PnpPlugin from 'pnp-webpack-plugin'
import { Configuration, DefinePlugin } from 'webpack'

import {
  PagesBuilderPlugin,
  PagesConfigOptions,
  pagesFrameworkName,
  pagesRuntimeName,
  Platform,
  Platforms
} from '../../../utils/compiler/targets/pages'
import { Project } from '../../../utils/project'

const entriesFromPages = (project: Project) => project.root.getFiles('pages').reduce(
  (acc, path) => {
    const name = basename(path, '.tsx')
    acc[name] = join('./pages', path)
    return acc
  },
  {} as Record<string, string>
)

export class PagesBuilder extends PagesBuilderPlugin {
  public getConfig = ({ project, mode, configs }: PagesConfigOptions) => {
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
          PnpPlugin
        ]
      },
      plugins: [
        new DefinePlugin({
          'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
        })
      ]
    }

    return {
      [Platforms.nodejs]: {
        ...configs.nodejs,
        name: Platforms.nodejs,
        target: 'node',
        ...baseConfig
      },
      [Platforms.webnew]: {
        ...configs.webnew,
        name: Platforms.webnew,
        target: 'web',
        optimization: mode === 'production' ? webOptimizations() : undefined,
        ...baseConfig
      },
      [Platforms.webold]: {
        ...configs.webold,
        name: Platforms.webold,
        target: 'web',
        optimization: mode === 'production' ? webOptimizations() : undefined,
        ...baseConfig
      }
    } as Record<Platform, Configuration>
  }
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
