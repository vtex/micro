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
  setMode,
  sourceMaps
} from 'webpack-blocks'
import DynamicPublicPathPlugin from 'webpack-dynamic-public-path'

import {
  externalPublicPathVariable,
  OnAssembleConfigOptions,
  OnAssemblePlugin,
  pagesFrameworkName,
  pagesRuntimeName,
  Platform
} from '../../framework/lifecycle/onAssemble'
import { Project } from '../../framework/project'
import { cacheGroup } from './modules/cacheGroups'

const entriesFromPages = (project: Project) => project.root.getFiles('pages').reduce(
  (acc, path) => {
    const name = basename(path, '.tsx')
    acc[name] = path.replace(project.root.path, './')
    return acc
  },
  {} as Record<string, string>
)

export class OnAssemble extends OnAssemblePlugin {
  public getConfig = ({ project, mode, configs }: OnAssembleConfigOptions): Record<Platform, Block<Context>> => {
    const common: Block<Context>[] = [
      setMode(mode),
      setContext(project.root.path),
      entryPoint(entriesFromPages(project)),
      defineConstants({
        'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
      }),
      resolve({
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        plugins: [
          PnpPlugin
        ]
      }),
      env('development', [
        addPlugins([
          new TimeFixPlugin()
        ]),
        sourceMaps('inline-source-map'),
        customConfig({
          watchOptions: {
            ignored: `${project.dist}`,
            aggregateTimeout: 300
          }
        }) as Block<Context>
      ]),
      customConfig({
        bail: true,
        node: false,
        profile: true,
        resolveLoader: {
          plugins: [
            PnpPlugin.moduleLoader(module)
          ]
        }
      }) as Block<Context>
    ]

    const web = [
      addPlugins([
        new DynamicPublicPathPlugin({
          externalPublicPath: externalPublicPathVariable
        })
      ]),
      optimization({
        runtimeChunk: {
          name: pagesRuntimeName
        },
        splitChunks: {
          maxInitialRequests: 30,
          maxAsyncRequests: 10
        }
      } as any),
      cacheGroup(pagesFrameworkName, /\/micro\/components\//),
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
        } as any)
      ])
    ]

    return {
      nodejs: group([
        configs.nodejs,
        ...common,
        customConfig({ name: 'nodejs', target: 'node' }) as Block<Context>
      ]),
      webnew: group([
        configs.webnew,
        ...common,
        ...web,
        customConfig({ name: 'webnew', target: 'web' }) as Block<Context>
      ]),
      webold: group([
        configs.webold,
        ...common,
        ...web,
        customConfig({ name: 'webold', target: 'web' }) as Block<Context>
      ])
    }
  }
}
