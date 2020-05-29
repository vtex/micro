import {
  BundlePlugin,
  pagesFrameworkName,
  pagesRuntimeName
} from '@vtex/micro-core'
import { cacheGroup } from '@vtex/micro-react'
import { Block, Context, group, resolve } from 'webpack-blocks'

import { aliases } from '../aliases'

export default class Bundle extends BundlePlugin {
  public getConfig = async (config: Block<Context>): Promise<Block<Context>> => {
    return group([
      config,
      resolve({
        alias: aliases.reduce(
          (acc, packageName) => {
            acc[packageName] = require.resolve(packageName)
            return acc
          },
          {} as Record<string, string>
        )
      }),
      cacheGroup(pagesRuntimeName, /\/react-in-viewport\/|\/react-router\/|\/react-router-dom\//),
      cacheGroup(pagesFrameworkName, /\/micro-react-router\//)
    ])
  }
}
