import { Block, Context } from 'webpack-blocks'

import { babel } from './modules/babel'

export const nodejsBabel: Block<Context> = babel({
  comments: true,
  minified: false,
  retainLines: true,
  shouldPrintComment: () => true,
  caller: { target: 'nodejs' },
  presets: [
    [
      require.resolve('@babel/preset-env'), {
        targets: {
          node: process.versions.node
        },
        /**
         * Here are unicorns ! 🦄
         * If we change this line to `modules: 'commonjs'`, babel will replace `import` to
         * `require` statments. Doing this webpack won't dynamic import modules and we will
         *  end up rendering the whole page in SSR. The bad news is that this will thus,
         * generate a HUGE monolitical entrypoint for being required during the SSR
        */
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
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-syntax-dynamic-import',
    '@loadable/babel-plugin'
  ].map(require.resolve as any)
} as any)
