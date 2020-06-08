import { Block, group } from 'webpack-blocks'

import { alias, BuildPlugin } from '@vtex/micro-core'

import { aliases } from '../aliases'

export default class Build extends BuildPlugin {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    return group([config, alias(aliases, module)])
  }
}
