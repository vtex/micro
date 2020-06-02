import { BundlePlugin } from '@vtex/micro-core/lib'
import { Block, Context, file, group, match } from 'webpack-blocks'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (config: Block<Context>): Promise<Block<Context>> => {
    const block: Block<Context>[] = [
      match(['*.png', '*.svg', '*.jpg', '*.gif', '*.ico'], [
        file({
          name: '[name].[ext]'
        })
      ])
    ]

    return group([
      config,
      ...block
    ])
  }
}
