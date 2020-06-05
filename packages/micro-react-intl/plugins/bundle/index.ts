import { Block, defineConstants, group, resolve } from 'webpack-blocks'

import {
  BundlePlugin,
  pagesFrameworkName,
  pagesRuntimeName,
} from '@vtex/micro-core/lib'
import { cacheGroup } from '@vtex/micro-react/plugins'

import { aliases } from '../aliases'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    return group([
      config,
      defineConstants({
        'process.platform': false,
      }),
      resolve({
        alias: aliases.reduce(
          (acc, packageName) => {
            acc[packageName] = require.resolve(packageName)
            return acc
          },
          {
            crypto: false,
          } as Record<string, string | boolean>
        ),
      }),
      cacheGroup(pagesRuntimeName, /\/react-intl\//),
      cacheGroup(pagesFrameworkName, /\/micro-react-intl\//),
    ])
  }
}
