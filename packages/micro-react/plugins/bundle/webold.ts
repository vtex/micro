import { Block, Context } from 'webpack-blocks';

import { babel } from './modules/babel';

export const weboldBabel: Block<Context> = babel({
  caller: { target: 'webold' },
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: 'cover 99.5%'
      }
    }],
    '@babel/preset-react',
    [
      '@babel/preset-typescript', {
        isTSX: true,
        allExtensions: true
      }
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    '@loadable/babel-plugin'
  ]
} as any);
