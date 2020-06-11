import { Configuration } from 'webpack'
import { Block, customConfig, group } from 'webpack-blocks'

import {
  alias,
  BuildHook,
  cacheGroup,
  pagesRuntimeName,
  Project,
  WebpackBuildTarget,
} from '@vtex/micro-core'

import { aliases } from '../aliases'

const getNodeConfig = (
  project: Project,
  target: WebpackBuildTarget
): Array<Block | Configuration> => {
  const externals =
    project.root.manifest.name === '@vtex/micro-plugin-react-router' &&
    target === 'render'
      ? {}
      : {
          'react-router-dom': 'ReactRouterDOM',
        }

  return [
    // TODO: Externals should respect at least the semver
    customConfig({
      externals,
    }),
  ]
}

const getWebConfig = (): Block[] => [
  alias(aliases, module),
  cacheGroup(
    pagesRuntimeName,
    /\/react-in-viewport\/|\/react-router\/|\/react-router-dom\//
  ),
]

export default class Build extends BuildHook {
  public getWebpackConfig = async (
    config: Block,
    target: WebpackBuildTarget
  ): Promise<Block> => {
    const block =
      target === 'web' ? getWebConfig() : getNodeConfig(this.project, target)
    return group([config, ...(block as any)])
  }
}
