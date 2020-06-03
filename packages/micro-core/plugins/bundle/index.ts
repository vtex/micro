import { Block, group } from 'webpack-blocks'

import { BundlePlugin } from '../../lib/lifecycles/bundle'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (
    config: Block
    // target: BundleTarget
  ): Promise<Block> => {
    const block: Block[] = []

    return group([config, ...block])
  }
}
