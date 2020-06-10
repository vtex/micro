import { Block, group } from 'webpack-blocks'

import { BundlePlugin } from '@vtex/micro-core'

import { assetsWebpackConfig } from '../common'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    const blocks: Block[] = assetsWebpackConfig()
    return group([config, ...blocks])
  }
}
