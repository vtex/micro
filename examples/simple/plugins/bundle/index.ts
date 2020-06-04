import { BundlePlugin } from '@vtex/micro-core/lib'
import { htmlTags, purgeCSS } from '@vtex/micro-css/plugins'
import { Block, group } from 'webpack-blocks'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    return group([
      config,
      purgeCSS({
        whitelist: () => htmlTags,
      }),
    ])
  }
}
