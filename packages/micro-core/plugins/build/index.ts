import { TransformOptions } from '@babel/core'
import babelmerge from 'babel-merge'

import { BuildPlugin, BuildTarget } from '../../lib/lifecycles/build'

export default class Build extends BuildPlugin {
  public getBabelConfig = async (
    previous: TransformOptions,
    target: BuildTarget
  ): Promise<TransformOptions> => {
    return babelmerge(previous, {
      root: this.project.rootPath,
      cwd: this.project.rootPath,
      sourceMaps: this.mode === 'production' ? false : 'inline',
      rootMode: 'root',
      minified: this.mode === 'production',
      retainLines: this.mode === 'production',
      shouldPrintComment: () => true,
      babelrc: false,
      envName: 'NODE_ENV',
      comments: this.mode === 'production',
      caller: { name: target },
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            targets:
              target === 'es6' ? { esmodules: true } : { node: 'current' },
            bugfixes: true,
            modules: target === 'es6' ? false : 'commonjs',
            exclude: [
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-proposal-async-generator-functions',
              '@babel/plugin-transform-async-to-generator',
              '@babel/plugin-transform-regenerator',
              '@babel/plugin-transform-arrow-functions',
              '@babel/plugin-transform-destructuring',
              '@babel/plugin-transform-for-of',
              '@babel/plugin-transform-spread',
              '@babel/plugin-transform-typeof-symbol',
            ],
          },
        ],
        [
          require.resolve('@babel/preset-typescript'),
          {
            isTSX: true,
            allExtensions: true,
          },
        ],
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-optional-chaining',
      ].map(require.resolve as (x: string) => string),
    })
  }
}
