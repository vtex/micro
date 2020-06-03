import {
  BundlePlugin,
  pagesFrameworkName,
  pagesRuntimeName,
} from '@vtex/micro-core/lib'
import { cacheGroup } from '@vtex/micro-react/plugins'
import { Block, group, resolve } from 'webpack-blocks'

import { aliases } from '../aliases'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    return group([
      config,
      resolve({
        alias: aliases.reduce((acc, packageName) => {
          acc[packageName] = require.resolve(packageName)
          return acc
        }, {} as Record<string, string>),
      }),
      cacheGroup(pagesRuntimeName, /\/react-intl\//),
      cacheGroup(pagesFrameworkName, /\/micro-react-intl\//),
    ])
  }
}
