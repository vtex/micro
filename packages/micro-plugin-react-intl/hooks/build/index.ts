import { Block, defineConstants, group } from 'webpack-blocks'

import { alias, BuildHook } from '@vtex/micro-core'

import { aliases } from '../aliases'

export default class Build extends BuildHook {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    return group([
      config,
      defineConstants({
        'process.platform': false,
      }),
      alias(aliases, module),
    ])
  }
}
