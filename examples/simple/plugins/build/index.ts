import { Block } from 'webpack-blocks'

import { BuildPlugin } from '@vtex/micro-core'

export default class Build extends BuildPlugin {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    return config
  }
}
