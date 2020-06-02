import { TransformOptions } from '@babel/core';
import deepmerge from 'deepmerge';
import { join } from 'path';

import {
  BuildPlugin,
  BuildTarget,
  SnowpackConfig
} from '../../lib/lifecycles/build';
import { MICRO_BUILD_DIR } from './../../lib/constants';

export default class Build extends BuildPlugin {
  public getBabelConfig = async (previous: TransformOptions, target: BuildTarget): Promise<TransformOptions> => {
    return deepmerge(previous, {
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
          require.resolve('@babel/preset-env'), {
            targets: target === 'es6'
              ? { esmodules: true }
              : { node: 'current' },
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
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-optional-chaining'
      ].map(require.resolve as (x: string) => string)
    });
  }

  public getSnowpackConfig = async (previous: SnowpackConfig): Promise<SnowpackConfig> => {
    return deepmerge(previous, {
      exclude: [
        'router/*', // TODO: remove this from here once server extensibility is solved
        `${MICRO_BUILD_DIR}/**/*`,
        'plugins/**/*',
        '!**/*.ts?(x)',
        '**/*.d.ts'
      ],
      installOptions: {
        dest: join(this.project.dist, this.target, 'es6'),
        env: {
          NODE_ENV: this.mode
        }
      }
    });
  }
}
