import { Block, Context } from 'webpack-blocks';

import { babel } from './modules/babel';

export const webnewBabel: Block<Context> = babel({
  comments: true,
  minified: false,
  retainLines: true,
  shouldPrintComment: () => true,
  caller: { target: 'webnew' },
  presets: [
    [
      require.resolve('@babel/preset-env'), {
        targets: {
          esmodules: true
        },
        modules: false,
        bugfixes: true,
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
      require.resolve('@babel/preset-react'), {
        useBuiltIns: true
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
    '@babel/plugin-syntax-dynamic-import',
    '@loadable/babel-plugin'
  ].map(require.resolve as any)
} as any);
