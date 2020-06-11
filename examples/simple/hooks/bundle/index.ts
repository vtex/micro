import { Block, group } from 'webpack-blocks'

import { BundleHook } from '@vtex/micro-core'
import { htmlTags, purgeCSS } from '@vtex/micro-plugin-css'

export default class Bundle extends BundleHook {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    return group([
      config,
      purgeCSS({
        whitelist: () => htmlTags,
      }),
    ])
  }
}
