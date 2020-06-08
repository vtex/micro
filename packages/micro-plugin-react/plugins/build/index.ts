import TerserJSPlugin from 'terser-webpack-plugin'
import { Configuration } from 'webpack'
import {
  Block,
  entryPoint,
  env,
  group,
  match,
  optimization,
} from 'webpack-blocks'

import { alias, BuildPlugin, entriesFromProject } from '@vtex/micro-core'

import { aliases } from '../alias'
import { babelConfig as moduleBabelConfig } from '../utils/babel/web'

export default class Build extends BuildPlugin {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    const entrypoints = await entriesFromProject(this.project)

    const block: Array<Configuration | Block> = [
      entryPoint(entrypoints),
      alias(aliases, module),
      env('production', [
        optimization({
          noEmitOnErrors: true,
          moduleIds: 'size',
          chunkIds: 'total-size',
          nodeEnv: 'production',
          removeAvailableModules: true,
          removeEmptyChunks: true,
          mergeDuplicateChunks: true,
          flagIncludedChunks: true,
          providedExports: true,
          usedExports: true,
          concatenateModules: true,
          sideEffects: true,
          portableRecords: false,
          minimizer: [
            new TerserJSPlugin({
              extractComments: true,
            }),
          ],
        } as any),
      ]),
    ]

    return group([
      config,
      ...(block as any),
      match(['*.tsx', '*.ts'], [moduleBabelConfig]),
    ])
  }
}
