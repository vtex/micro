import { join } from 'path'

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
  resolve,
  setContext,
  setMode,
  sourceMaps,
} from 'webpack-blocks'

import { BundlePlugin } from '../../lib/lifecycles/bundle'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (
    config: Block
    // target: BundleTarget
  ): Promise<Block> => {
    const wpInternalsDist = join(
      this.project.dist,
      this.target,
      'webpack_internals'
    )
    const cacheConfig: Configuration = {
      cache: {
        name: this.mode,
        version: this.mode,
        type: 'filesystem',
        managedPaths: ['./node_modules'].map((p) =>
          join(this.project.rootPath, p)
        ),
        cacheDirectory: join(wpInternalsDist, 'cache'),
      },
      recordsPath: join(wpInternalsDist, 'records.json'),
    }
    const block: Array<Block | Configuration> = [
      customConfig(cacheConfig),
      setMode(this.mode),
      setContext(this.project.rootPath),
      defineConstants({
        'process.env.NODE_ENV': this.mode,
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
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
      }),
    ]

    return group([config, ...(block as any)])
  }
}
