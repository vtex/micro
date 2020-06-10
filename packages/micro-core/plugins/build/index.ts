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

import { BuildPlugin, WebpackBuildTarget } from '../../lib/lifecycles/build'
import { Project } from '../../lib/project'
import {
  nodeEntryFromProject,
  nodeExternalsFromProject,
  webEntriesFromProject,
} from '../utils/common'

export const MICRO_ENTRYPOINT = 'micro.entrypoint'

const nodeConfig = async (project: Project): Promise<Block[]> => [
  entryPoint(await nodeEntryFromProject(project)),
  customConfig({
    target: 'node',
    externals: await nodeExternalsFromProject(project),
  }) as Block,
  setOutput({
    library: project.root.toString(),
    libraryTarget: 'global',
  }),
  optimization({
    minimize: false,
  }),
]

const webFederationConfig = async (project: Project): Promise<Block[]> => [
  entryPoint(await webEntriesFromProject(project)),
  addPlugins([
    // new webpack.container.ModuleFederationPlugin({
    //   name: project.root.manifest.name,
    //   library: {
    //     type: 'var',
    //     name: slugify(project.root.manifest.name),
    //   },
    //   filename: MICRO_ENTRYPOINT,
    //   exposes: await exposesFromProject(project),
    //   // shared: project.root.manifest.dependencies ?? {},
    //   remotes: await webFederationRemotesFromProject(project),
    // }),
  ]),
  customConfig({
    target: 'web',
  }) as Block,
  optimization({
    runtimeChunk: {
      name: 'webpack-runtime',
    },
  } as any), // TODO: why this as any ?
  setOutput({
    publicPath: '/assets/',
  }),
]

export default class Build extends BuildPlugin {
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
      target === 'node'
        ? await nodeConfig(this.project)
        : await webFederationConfig(this.project)

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
          name: this.mode,
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
