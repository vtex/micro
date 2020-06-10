import { Block, group } from 'webpack-blocks'

import { BuildHook, WebpackBuildTarget } from '@vtex/micro-core'

import { getWebConfig } from '../utils/web'
import { getNodeConfig } from './node'

export default class Build extends BuildHook {
  public getWebpackConfig = async (
    config: Block,
    target: WebpackBuildTarget
  ): Promise<Block> => {
    const blocks =
      target === 'node'
        ? await getNodeConfig(target, this.project)
        : await getWebConfig(target, this.project)

    return group([config, ...(blocks as any)])
  }
}
