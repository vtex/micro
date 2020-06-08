import { join } from 'path'

import PnpPlugin from 'pnp-webpack-plugin'
import TimeFixPlugin from 'time-fix-plugin'
import { Configuration } from 'webpack'
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
  sourceMaps,
} from 'webpack-blocks'

import { BundlePlugin, BundleTarget } from '../../lib/lifecycles/bundle'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (
    config: Block,
    target: BundleTarget
  ): Promise<Block> => {
    const wpInternalsDist = join(
      this.project.dist,
      this.target,
      target,
      'webpack_internals'
    )
    const block: Array<Block | Configuration> = [
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
        recordsPath: join(wpInternalsDist, 'records.json'),
        target: 'web',
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
      optimization({
        runtimeChunk: {
          name: 'webpack-runtime',
        },
      } as any), // TODO: why this as any ?
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
      performance({
        hints: 'warning',
      }),
    ]

    return group([config, ...(block as any)])
  }
}
