import { join } from 'path'

import PnpPlugin from 'pnp-webpack-plugin'
import TimeFixPlugin from 'time-fix-plugin'
import { Configuration } from 'webpack'
import {
  addPlugins,
  Block,
  customConfig,
  defineConstants,
  entryPoint,
  env,
  group,
  optimization,
  performance,
  resolve,
  setContext,
  setMode,
  setOutput,
  sourceMaps,
} from 'webpack-blocks'

import { BuildHook, WebpackBuildTarget } from '../../lib/lifecycles/build'
import { Project } from '../../lib/project'
import {
  nodeExternalsFromProject,
  webAliasesFromProject,
  webEntriesFromProject,
  entries,
} from '../utils/common'

export const MICRO_ENTRYPOINT = 'micro.entrypoint'

const nodeConfig = async (
  project: Project,
  target: 'components' | 'render' | 'route' | 'pages'
): Promise<Block[]> => [
  entryPoint({ index: entries[target] }),
  customConfig({
    target: 'node',
    externals: await nodeExternalsFromProject(project),
    externalsType: 'global',
  }) as Block,
  setOutput({
    library: `${project.root.toString()}/${target}`,
    libraryTarget: 'global',
  }),
  optimization({
    minimize: false,
  }),
]

const webConfig = async (project: Project): Promise<Block[]> => [
  entryPoint(await webEntriesFromProject(project)),
  customConfig({
    target: 'web',
  }) as Block,
  resolve({
    alias: await webAliasesFromProject(project),
  }),
  setOutput({
    publicPath: '/assets/',
  }),
  optimization({
    runtimeChunk: {
      name: 'webpack-runtime',
    },
  } as any), // TODO: why this as any ?
]

export default class Build extends BuildHook {
  public getWebpackConfig = async (
    config: Block,
    target: WebpackBuildTarget
  ) => {
    const wpInternalsDist = join(
      this.project.dist,
      this.target,
      target,
      'webpack_internals'
    )
    const targetConfigs =
      target === 'web'
        ? await webConfig(this.project)
        : await nodeConfig(this.project, target)

    const blocks: Array<Block | Configuration> = [
      setMode(this.mode),
      setContext(this.project.rootPath),
      defineConstants({
        'process.env.NODE_ENV': this.mode,
      }),
      customConfig({
        stats: {
          hash: true,
          publicPath: true,
          assets: true,
          chunks: false,
          modules: false,
          source: false,
          errorDetails: false,
          timings: false,
        },
        cache: {
          name: `${target}::${this.mode}`,
          version: `${target}::${this.mode}`,
          type: 'filesystem',
          managedPaths: ['./.yarn'].map((p) => join(this.project.rootPath, p)),
          cacheDirectory: join(wpInternalsDist, 'cache'),
        },
        name: target,
        bail: true,
        node: false,
        profile: true,
        resolveLoader: {
          plugins: [PnpPlugin.moduleLoader(module)],
        },
        externals: Object.keys(
          this.project.root.manifest.peerDependencies ?? {}
        ),
      }),
      env('development', [
        addPlugins([new TimeFixPlugin()]),
        sourceMaps('inline-source-map'),
        customConfig({
          watchOptions: {
            ignored: `${this.project.dist}`,
            aggregateTimeout: 300,
          },
        }) as Block,
      ]),
      resolve({
        plugins: [PnpPlugin],
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
      }),
      env('production', [
        performance({
          hints: 'warning',
        }),
      ]),
      ...targetConfigs,
    ]
    return group([config, ...(blocks as any)])
  }
}
