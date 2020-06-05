import { Block, group, resolve } from 'webpack-blocks'

import {
  BundlePlugin,
  pagesFrameworkName,
  pagesRuntimeName,
} from '@vtex/micro-core'
import { cacheGroup } from '@vtex/micro-plugin-react'

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
      cacheGroup(
        pagesRuntimeName,
        /\/react-in-viewport\/|\/react-router\/|\/react-router-dom\//
      ),
      cacheGroup(pagesFrameworkName, /\/micro-react-router\//),
    ])
  }
}
