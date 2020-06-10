import { Block } from 'webpack-blocks'

import { BuildHook } from '@vtex/micro-core'

export default class Build extends BuildHook {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    return config
  }
}
