import { Block } from 'webpack-blocks'

import { babel } from './babel'

export const babelConfig: Block = babel({
  comments: true,
  minified: false,
  retainLines: true,
  shouldPrintComment: () => true,
  caller: {
    target: 'web-legacy',
  },
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          browsers: 'cover 99.5%',
        },
        modules: false,
        bugfixes: true,
      },
    ],
    [
      require.resolve('@babel/preset-react'),
      {
        useBuiltIns: true,
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
    '@babel/plugin-syntax-dynamic-import',
    '@loadable/babel-plugin',
  ].map((p) => require.resolve(p)),
} as any)
