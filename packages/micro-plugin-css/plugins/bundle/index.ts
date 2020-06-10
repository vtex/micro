import { Block, group } from 'webpack-blocks'

import { BundlePlugin } from '@vtex/micro-core'

import { cssWebpackConfig } from '../common'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    const block: Block[] = await cssWebpackConfig(this.project)
    return group([config, ...block])
  }
}
