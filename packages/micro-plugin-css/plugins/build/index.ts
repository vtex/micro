import { Block, group } from 'webpack-blocks'

import { BuildPlugin } from '@vtex/micro-core'

import { cssWebpackConfig } from '../common'

export default class Build extends BuildPlugin {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    const block: Block[] = await cssWebpackConfig(this.project)
    return group([config, ...block])
  }
}
