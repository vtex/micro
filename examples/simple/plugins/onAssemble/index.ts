import { OnAssemblePlugin } from '@vtex/micro'
import { purgeCSS } from '@vtex/micro-react'
import { Block, Context, group } from 'webpack-blocks'

export default class OnAssemble extends OnAssemblePlugin {
  public getConfig = async (config: Block<Context>): Promise<Block<Context>> => {
    return group([
      config,
      purgeCSS({
        whitelistPatterns: () => [
          /^(?!uk-).*/ // todo: review this
        ]
      })
    ])
  }
}
