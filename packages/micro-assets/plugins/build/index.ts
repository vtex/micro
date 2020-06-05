import { TransformOptions } from '@babel/core'
import merge from 'babel-merge'

import { BuildPlugin, BuildTarget } from '@vtex/micro-core/lib'

const cjsPlugins = [
  [
    require.resolve('babel-plugin-transform-remove-imports'),
    { test: '\\.(png|svg|jpg|gif)$' },
  ],
  require.resolve('babel-plugin-inline-json-import'),
]

export default class Build extends BuildPlugin {
  public getBabelConfig = async (
    previous: TransformOptions,
    target: BuildTarget
  ): Promise<TransformOptions> => {
    // TODO: Do we really need this ?
    const plugins = target === 'cjs' ? cjsPlugins : []
    return merge(previous, { plugins })
  }
}
