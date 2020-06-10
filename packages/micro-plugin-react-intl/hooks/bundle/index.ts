import { Block, defineConstants, group } from 'webpack-blocks'

import {
  alias,
  BundleHook,
  pagesFrameworkName,
  pagesRuntimeName,
} from '@vtex/micro-core'
import { cacheGroup } from '@vtex/micro-plugin-react'

import { aliases } from '../aliases'

export default class Bundle extends BundleHook {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    return group([
      config,
      defineConstants({
        'process.platform': false,
      }),
      alias(aliases, module),
      cacheGroup(pagesRuntimeName, /\/react-intl\//),
      cacheGroup(pagesFrameworkName, /\/micro-react-intl\//),
    ])
  }
}