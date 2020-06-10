import { Block, group } from 'webpack-blocks'

import { alias, BuildHook } from '@vtex/micro-core'

import { aliases } from '../aliases'

export default class Build extends BuildHook {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    return group([config, alias(aliases, module)])
  }
}
