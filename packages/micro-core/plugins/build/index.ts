import { Block } from 'webpack-blocks'

import { BuildPlugin, WebpackBuildTarget } from '../../lib/lifecycles/build'

export default class Build extends BuildPlugin {
  public getWebpackConfig = async (config: Block, target: WebpackBuildTarget) =>
    config
}
