import { BundlePlugin } from '@vtex/micro-core'
import { Block, Context, group } from 'webpack-blocks'
import { htmlTags, purgeCSS } from '@vtex/micro-css'

export default class Bundle extends BundlePlugin {
  public getConfig = async (config: Block<Context>): Promise<Block<Context>> => {
    return group([
      config,
      purgeCSS({
        whitelist: () => htmlTags
      })
    ])
  }
}