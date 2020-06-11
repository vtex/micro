import { Configuration } from 'webpack'
import { Block, group } from 'webpack-blocks'

import { BuildHook, WebpackBuildTarget } from '@vtex/micro-core'

const getNodeConfig = (): Array<Block | Configuration> => [
  // customConfig({
  //   externals: {
  //     'react-router-dom': 'ReactRouterDom',
  //   },
  //   externalsType: 'global',
  // }),
]

const getWebConfig = (): Block[] => [
  // [alias(aliases, module)]
  // cacheGroup(
  //   pagesRuntimeName,
  //   /\/react-in-viewport\/|\/react-router\/|\/react-router-dom\//
  // ),
]

export default class Build extends BuildHook {
  public getWebpackConfig = async (
    config: Block,
    target: WebpackBuildTarget
  ): Promise<Block> => {
    const block = target === 'node' ? getNodeConfig() : getWebConfig()
    return group([config, ...(block as any)])
  }
}
