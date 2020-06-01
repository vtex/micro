import { TransformOptions } from '@babel/core'
import { BuildPlugin, BuildTarget } from '@vtex/micro-core'

export default class Build extends BuildPlugin {
  public getConfig = async (
    previous: TransformOptions,
    target: BuildTarget
  ): Promise<TransformOptions> => {
    // TODO: Do we really need this ?
    const plugins =
      target === 'cjs'
        ? [require.resolve('babel-plugin-ignore-html-and-css-imports')]
        : []
    return {
      ...previous,
      plugins: [...(previous.plugins ?? []), ...plugins],
    }
  }
}
