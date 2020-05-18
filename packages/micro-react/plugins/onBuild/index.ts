import { TransformOptions } from '@babel/core'
import { OnBuildPlugin } from '@vtex/micro'

export class OnBuild extends OnBuildPlugin {
  public getConfig = (previous: TransformOptions): TransformOptions => ({
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
      ...[
        '@babel/plugin-syntax-dynamic-import',
        '@loadable/babel-plugin'
      ].map(require.resolve as (x: string) => string)
    ]
  })
}
