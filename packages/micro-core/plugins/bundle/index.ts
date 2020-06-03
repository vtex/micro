
// import {
//   BundlePlugin,
//   BundleTarget,
//   pagesFrameworkName,
//   pagesRuntimeName,
//   Project
// } from '../'

import { basename } from 'path'
import {
  addPlugins,
  Block,
  Context,
  customConfig,
  defineConstants,
  entryPoint,
  env,
  group,
  match,
  optimization,
  performance,
  resolve,
  setContext,
  setMode,
  sourceMaps
} from 'webpack-blocks'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (config: Block<Context>, target: BundleTarget): Promise<Block<Context>> => {
    const block: Block<Context>[] = [
      
    ]

    return group([
      config,
      ...block
    ])
  }
}
