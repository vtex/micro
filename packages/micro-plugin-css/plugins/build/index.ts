import { Block } from 'webpack-blocks'

import { BuildPlugin, WebpackBuildTarget } from '@vtex/micro-core'

export default class Build extends BuildPlugin {
  public getWebpackConfig = async (
    config: Block,
    target: WebpackBuildTarget
  ): Promise<Block> => config
}
