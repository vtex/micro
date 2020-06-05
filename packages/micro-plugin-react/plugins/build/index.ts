import { TransformOptions } from '@babel/core'
import merge from 'babel-merge'

import { BuildPlugin, BuildTarget } from '@vtex/micro-core'

export default class Build extends BuildPlugin {
  public getBabelConfig = async (
    previous: TransformOptions,
    target: BuildTarget
  ): Promise<TransformOptions> => {
    // TODO: Be able to include this plugin for es6
    const loadablePlugin =
      target === 'es6' ? [] : [require.resolve('@loadable/babel-plugin')]
    return merge(previous, {
      presets: [
        [
          require.resolve('@babel/preset-react'),
          {
            useBuiltIns: true,
          },
        ],
      ],
      plugins: [
        require.resolve('@babel/plugin-syntax-dynamic-import'),
        ...loadablePlugin,
      ],
    })
  }
}
