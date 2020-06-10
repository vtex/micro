import { Block, group } from 'webpack-blocks'

import { BundleHook } from '@vtex/micro-core'

import { cssWebpackConfig } from '../common'

export default class Bundle extends BundleHook {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    const block: Block[] = await cssWebpackConfig(this.project)
    return group([config, ...block])
  }
}
