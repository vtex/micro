import { Configuration } from 'webpack'
import { Block, group } from 'webpack-blocks'

import { BuildHook, Project, WebpackBuildTarget } from '@vtex/micro-core'

import { getWebConfig } from '../bundle'

const getNodeConfig = (
  _project: Project,
  _target: WebpackBuildTarget
): Array<Block | Configuration> => {
  return []
}

export default class Build extends BuildHook {
  public getWebpackConfig = async (
    config: Block,
    target: WebpackBuildTarget
  ): Promise<Block> => {
    const blocks =
      target === 'web' ? getWebConfig() : getNodeConfig(this.project, target)

    return group([config, ...(blocks as any)])
  }
}
