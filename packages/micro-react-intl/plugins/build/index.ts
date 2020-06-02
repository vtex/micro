import { TransformOptions } from '@babel/core'
import { BuildPlugin } from '@vtex/micro-core/lib'
import merge from 'babel-merge'

export default class Build extends BuildPlugin {
  public getBabelConfig = async (previous: TransformOptions): Promise<TransformOptions> => merge(previous, {
    plugins: [
      require.resolve('babel-plugin-inline-json-import')
    ]
  })
}
