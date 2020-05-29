import { TransformOptions } from '@babel/core'
import { BuildPlugin, BuildTarget } from '@vtex/micro-core'

const cjsPlugins = [
  [require.resolve('babel-plugin-transform-remove-imports'), { test: '\\.(png|svg|jpg|gif)$' }],
  require.resolve('babel-plugin-inline-json-import')
]

export default class Build extends BuildPlugin {
  public getConfig = async (previous: TransformOptions, target: BuildTarget): Promise<TransformOptions> => {
    // TODO: Do we really need this ?
    const plugins = target === 'cjs' ? cjsPlugins : []
    return ({
      ...previous,
      plugins: [
        ...previous.plugins || [],
        ...plugins
      ]
    })
  }
}
