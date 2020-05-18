import { TransformOptions } from '@babel/core'

import { OnBuildPlugin } from '../../lib/lifecycle/onBuild'

export class OnBuild extends OnBuildPlugin {
  public getConfig = (previous: TransformOptions): TransformOptions => ({
    ...previous,
    rootMode: 'root',
    minified: false,
    retainLines: true,
    shouldPrintComment: () => true,
    babelrc: false,
    envName: 'NODE_ENV',
    comments: process.env.NODE_ENV === 'production',
    caller: {
      name: 'nodejs'
    },
    presets: [
      ...previous.presets || [],
      [
        require.resolve('@babel/preset-env'), {
          targets: {
            esmodules: true
          },
          modules: false,
          exclude: [
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-proposal-async-generator-functions',
            '@babel/plugin-transform-async-to-generator',
            '@babel/plugin-transform-regenerator',
            '@babel/plugin-transform-arrow-functions',
            '@babel/plugin-transform-destructuring',
            '@babel/plugin-transform-for-of',
            '@babel/plugin-transform-spread',
            '@babel/plugin-transform-typeof-symbol'
          ]
        }
      ],
      [
        require.resolve('@babel/preset-typescript'), {
          isTSX: true,
          allExtensions: true
        }
      ]
    ],
    plugins: [
      ...previous.plugins || [],
      ...[
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-optional-chaining'
      ].map(require.resolve as (x: string) => string)
    ]
  })
}
