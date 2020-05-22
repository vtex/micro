import { basename } from 'path'
import PnpPlugin from 'pnp-webpack-plugin'
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
  optimization,
  resolve,
  setContext,
  performance,
  setMode,
  sourceMaps
} from 'webpack-blocks'
import DynamicPublicPathPlugin from 'webpack-dynamic-public-path'

import { externalPublicPathVariable } from '../../components/publicPaths'
import {
  AssembleTarget,
  OnAssemblePlugin,
  pagesFrameworkName,
  pagesRuntimeName
} from '../../lib/lifecycles/onAssemble'
import { Project } from '../../lib/project'
import { cacheGroup } from './modules/cacheGroups'

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

export default class OnAssemble extends OnAssemblePlugin {
  public getConfig = async (config: Block<Context>, target: AssembleTarget): Promise<Block<Context>> => {
    const entrypoints = await entriesFromPages(this.project)
    const block: Block<Context>[] = [
      setMode(this.mode),
      setContext(this.project.rootPath),
      entryPoint(entrypoints),
      defineConstants({
        'process.env.NODE_ENV': this.mode
      }),
      resolve({
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        plugins: [
          PnpPlugin
        ]
      }),
      optimization({
        runtimeChunk: {
          name: pagesRuntimeName
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
      cacheGroup(pagesFrameworkName, /\/micro\/components\//),
      addPlugins([
        new DynamicPublicPathPlugin({
          externalPublicPath: externalPublicPathVariable
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
      ]),
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
          portableRecords: false
        } as any),
        performance({
          hints: 'warning'
        })
      ])
    ]

    return group([
      config,
      ...block
    ])
  }
}
