import { Block, defineConstants, group } from 'webpack-blocks'

import {
  alias,
  BundleHook,
  cacheGroup,
  pagesRuntimeName,
} from '@vtex/micro-core'

import { aliases } from '../aliases'

export const getWebConfig = () => [
  defineConstants({
    'process.platform': false,
  }),
  alias(aliases, module),
  cacheGroup(pagesRuntimeName, /\/react-intl\//),
]

export default class Bundle extends BundleHook {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    const blocks = getWebConfig()
    return group([config, ...(blocks as any)])
  }
}
