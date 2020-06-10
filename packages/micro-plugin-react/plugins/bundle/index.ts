import { Configuration } from 'webpack'
import { Block, group } from 'webpack-blocks'

import { BundlePlugin, BundleTarget } from '@vtex/micro-core'

import { getWebConfig } from '../utils/web'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (
    config: Block,
    target: BundleTarget
  ): Promise<Block> => {
    const block: Array<Block | Configuration> = await getWebConfig(
      target,
      this.project
    )
    return group([config, ...(block as any)])
  }
}
