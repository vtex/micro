import { Block, group } from 'webpack-blocks'

import { BuildHook } from '@vtex/micro-core'

import { assetsWebpackConfig } from '../common'

export default class Build extends BuildHook {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    const blocks: Block[] = assetsWebpackConfig()
    return group([config, ...blocks])
  }
}
