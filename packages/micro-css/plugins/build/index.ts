import { TransformOptions } from '@babel/core'
import merge from 'babel-merge'

import { BuildPlugin, BuildTarget } from '@vtex/micro-core/lib'

export default class Build extends BuildPlugin {
  public getBabelConfig = async (
    previous: TransformOptions,
    target: BuildTarget
  ): Promise<TransformOptions> => {
    // TODO: Do we really need this ?
    const plugins =
      target === 'cjs'
        ? [require.resolve('babel-plugin-ignore-html-and-css-imports')]
        : []
    return merge(previous, { plugins })
  }
}
