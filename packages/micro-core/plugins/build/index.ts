import { join } from 'path'

import PnpPlugin from 'pnp-webpack-plugin'
import TimeFixPlugin from 'time-fix-plugin'
import webpack, { Configuration } from 'webpack'
import {
  addPlugins,
  Block,
  customConfig,
  defineConstants,
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
import { exposesFromProject, remotesFromProject } from '../utils/common'

const nodeConfig = async (project: Project): Promise<Block[]> => [
  customConfig({
    target: 'async-node',
  }) as Block,
  setOutput({
    libraryTarget: 'commonjs2',
  }),
  optimization({
    minimize: false,
  }),
  addPlugins([
    new webpack.container.ModuleFederationPlugin({
      name: project.root.manifest.name,
      library: { type: 'commonjs2' },
      filename: 'micro_entrypoint.js',
      exposes: await exposesFromProject(project),
      // shared: project.root.manifest.dependencies ?? {},
      remotes: remotesFromProject(project),
    }),
  ]),
]

const webFederationConfig = async (project: Project): Promise<Block[]> => [
  addPlugins([
    new webpack.container.ModuleFederationPlugin({
      name: project.root.manifest.name,
      library: {
        type: 'var',
        name: 'Exposed', // project.root.manifest.name,
      },
      filename: 'micro_entrypoint.js',
      exposes: await exposesFromProject(project),
      // shared: project.root.manifest.dependencies ?? {},
      remotes: Object.keys(remotesFromProject(project)),
    }),
  ]),
  customConfig({
    target: 'web',
  }) as Block,
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
      target === 'node-federation'
        ? await nodeConfig(this.project)
        : await webFederationConfig(this.project)

    if (target === 'web') {
      throw new Error('💣 Target web is not supported yet')
    }

    const blocks: Array<Block | Configuration> = [
      setMode(this.mode),
      setContext(this.project.rootPath),
      defineConstants({
        'process.env.NODE_ENV': this.mode,
      }),
      customConfig({
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
