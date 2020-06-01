import { BundlePlugin } from '@vtex/micro-core'
import { Block, file, group, match } from 'webpack-blocks'

export default class Bundle extends BundlePlugin {
  public getConfig = async (config: Block): Promise<Block> => {
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
