import {
  cacheGroup,
  OnAssemblePlugin,
  pagesFrameworkName,
  pagesRuntimeName
} from '@vtex/micro'
import { Block, Context, group, resolve } from 'webpack-blocks'

import { aliases } from '../aliases'

export default class OnAssemble extends OnAssemblePlugin {
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
