import { Block, file, group, match } from 'webpack-blocks'

import { BundlePlugin } from '@vtex/micro-core'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    const block: Block[] = [
      match(
        ['*.png', '*.svg', '*.jpg', '*.gif', '*.ico'],
        [
          file({
            name: '[name].[ext]',
          }),
        ]
      ),
    ]

    return group([config, ...block])
  }
}
