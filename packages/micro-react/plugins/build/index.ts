import { TransformOptions } from '@babel/core'
import {
  Alias,
  BuildPlugin,
  BuildTarget,
  packageToAlias
} from '@vtex/micro-core/lib'
import merge from 'babel-merge'

import { aliases } from '../aliases'

export default class Build extends BuildPlugin {
  public getBabelConfig = async (previous: TransformOptions, target: BuildTarget): Promise<TransformOptions> => {
    // TODO: Be able to include this plugin for es6
    const loadablePlugin = target === 'es6' ? [] : [require.resolve('@loadable/babel-plugin')]
    return merge(previous, {
      presets: [
        [
          require.resolve('@babel/preset-react'), {
            useBuiltIns: true
          }
        ]
      ],
      plugins: [
        require.resolve('@babel/plugin-syntax-dynamic-import'),
        ...loadablePlugin
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
