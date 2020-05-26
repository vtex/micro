import { TransformOptions } from '@babel/core'

import {
  Alias,
  BuildTarget,
  OnBuildPlugin,
  packageToAlias
} from '../../lib/lifecycles/onBuild'
import { aliases } from '../aliases'

export default class OnBuild extends OnBuildPlugin {
  public getConfig = async (previous: TransformOptions, target: BuildTarget): Promise<TransformOptions> => {
    // TODO: Do we really need this ?
    const plugins = target === 'cjs'
      ? [require.resolve('babel-plugin-ignore-html-and-css-imports')]
      : []
    return ({
      ...previous,
      plugins: [
        ...previous.plugins || [],
        ...plugins
      ]
    })
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
