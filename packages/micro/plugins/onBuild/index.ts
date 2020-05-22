import { TransformOptions } from '@babel/core'

import { BuildTarget, OnBuildPlugin } from '../../lib/lifecycles/onBuild'

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
}
