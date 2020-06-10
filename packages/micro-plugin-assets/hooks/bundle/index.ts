import { Block, group } from 'webpack-blocks'

import { BundleHook } from '@vtex/micro-core'

import { assetsWebpackConfig } from '../common'

export default class Bundle extends BundleHook {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    const blocks: Block[] = assetsWebpackConfig()
    return group([config, ...blocks])
  }
}
