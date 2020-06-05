import { htmlTags, purgeCSS } from '@vtex/micro-plugin-css/plugins'
import { Block, group } from 'webpack-blocks'

import { BundlePlugin } from '@vtex/micro-core'

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
