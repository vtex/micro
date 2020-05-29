import { OnAssemblePlugin } from '@vtex/micro'
import { Block, Context, group } from 'webpack-blocks'
import { htmlTags, purgeCSS } from '@vtex/micro-css'

export default class OnAssemble extends OnAssemblePlugin {
  public getConfig = async (config: Block<Context>): Promise<Block<Context>> => {
    return group([
      config,
      purgeCSS({
        whitelist: () => htmlTags
      })
    ])
  }
}
