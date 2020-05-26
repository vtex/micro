import { TransformOptions } from '@babel/core'
import { Alias, BuildTarget, OnBuildPlugin, packageToAlias } from '@vtex/micro'

import { aliases } from '../aliases'

export default class OnBuild extends OnBuildPlugin {
  public getConfig = async (previous: TransformOptions, target: BuildTarget): Promise<TransformOptions> => {
    // TODO: Be able to include this plugin for es6
    const loadablePlugin = target === 'es6' ? [] : [require.resolve('@loadable/babel-plugin')]
    return ({
      ...previous,
      presets: [
        ...previous.presets || [],
        [
          require.resolve('@babel/preset-react'), {
            useBuiltIns: true
          }
        ]
      ],
      plugins: [
        ...previous.plugins || [],
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
