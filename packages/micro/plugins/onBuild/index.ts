import { TransformOptions } from '@babel/core'

import {
  Alias,
  OnBuildPlugin,
  packageToAlias
} from '../../lib/lifecycles/onBuild'
import { aliases } from '../aliases'

export default class OnBuild extends OnBuildPlugin {
  public getConfig = async (previous: TransformOptions): Promise<TransformOptions> => {
    return previous
  }

  public getAliases = async (previous: Alias[]): Promise<Alias[]> => {
    const modules = await Promise.all(aliases.map(
      a => packageToAlias(a, require.resolve)
    ))
    return [
      ...previous,
      ...modules
    ]
  }
}
