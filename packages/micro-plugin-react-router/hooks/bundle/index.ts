import { Block, group } from 'webpack-blocks'

import {
  alias,
  BundleHook,
  cacheGroup,
  pagesFrameworkName,
  pagesRuntimeName,
} from '@vtex/micro-core'

import { aliases } from '../aliases'

export default class Bundle extends BundleHook {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    return group([
      config,
      alias(aliases, module),
      cacheGroup(
        pagesRuntimeName,
        /\/react-in-viewport\/|\/react-router\/|\/react-router-dom\//
      ),
    ])
  }
}
