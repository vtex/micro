import LoadablePlugin from '@loadable/webpack-plugin'
import {
  externalPublicPathVariable,
  mergeConfigs,
  OnAssembleConfigOptions,
  OnAssemblePlugin,
  pagesFrameworkName,
  pagesRuntimeName,
  Platform
} from '@vtex/micro/framework'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import PurgeCSSPlugin from 'purgecss-webpack-plugin'
import TerserJSPlugin from 'terser-webpack-plugin'
import { Configuration } from 'webpack'
import MessagesPlugin from 'webpack-messages'

export class OnAssemble extends OnAssemblePlugin {
  public getConfig = ({ mode, configs, project }: OnAssembleConfigOptions) => {
    const moduleFiles = project.resolveFiles('pages|components|utils')
    const exclude = (path: string) => moduleFiles.every(m => !path.startsWith(m))
    const baseConfig: Configuration = {
      plugins: [
        new LoadablePlugin({
          outputAsset: false,
          writeToDisk: false
        }),
        new MiniCssExtractPlugin({
          filename: '[name].css'
        }),
        new PurgeCSSPlugin({
          paths: project.resolveFiles('pages|components')
        })
      ],
      stats: {
        hash: true,
        publicPath: true,
        assets: true,
        chunks: false,
        modules: false,
        source: false,
        errorDetails: false,
        timings: false
      },
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [
              {
                loader: require.resolve(MiniCssExtractPlugin.loader),
                options: {
                  esModule: true
                }
              },
              {
                loader: require.resolve('css-loader')
              }
            ]
          },
          {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
              {
                loader: require.resolve('file-loader'),
                options: {
                  publicPath: externalPublicPathVariable
                }
              }
            ]
          }
        ]
      }
    }

    const baseOptimization = mode === 'production'
      ? {
        minimizer: [
          new TerserJSPlugin({
            extractComments: true
          }),
          new OptimizeCSSAssetsPlugin({
            cssProcessorPluginOptions: {
              preset: ['default', { discardComments: { removeAll: true } }]
            }
          })
        ]
      } : undefined

    const configByPlatform: Record<Platform, Configuration> = {
      nodejs: {
        ...baseConfig,
        plugins: [
          ...baseConfig.plugins || [],
          new MessagesPlugin({
            name: 'nodejs',
            logger: (str: any) => console.log(`>> ${str}`)
          })
        ],
        name: 'nodejs',
        optimization: baseOptimization,
        externals: [
          {
            react: 'commonjs2 react',
            'react-dom': 'commonjs2 react-dom',
            '@loadable/component': 'commonjs2 @loadable/component'
          }
        ],
        module: {
          rules: [
            ...baseConfig.module?.rules || [],
            {
              test: /\.tsx?$/,
              exclude,
              use: [
                nodejsBabelRules()
              ]
            }
          ]
        }
      },
      webnew: {
        ...baseConfig,
        plugins: [
          ...baseConfig.plugins || [],
          new MessagesPlugin({
            name: 'webnew',
            logger: (str: any) => console.log(`>> ${str}`)
          })
        ],
        name: 'webnew',
        optimization: {
          ...baseOptimization,
          ...webOptimization(configs.webnew)
        },
        module: {
          rules: [
            ...baseConfig.module?.rules || [],
            {
              test: /\.tsx?$/,
              exclude,
              use: [
                webNewBabelRules()
              ]
            }
          ]
        }
      },
      webold: {
        ...baseConfig,
        plugins: [
          ...baseConfig.plugins || [],
          new MessagesPlugin({
            name: 'webold',
            logger: (str: any) => console.log(`>> ${str}`)
          })
        ],
        name: 'webold',
        optimization: {
          ...baseOptimization,
          ...webOptimization(configs.webnew)
        },
        module: {
          rules: [
            ...baseConfig.module?.rules || [],
            {
              test: /\.tsx?$/,
              exclude,
              use: [
                webOldBabelRules()
              ]
            }
          ]
        }
      }
    }

    return mergeConfigs(configs, configByPlatform)
  }
}

const nodejsBabelRules = () => ({
  loader: require.resolve('babel-loader'),
  options: {
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
  }
})

const webOldBabelRules = () => ({
  loader: 'babel-loader',
  options: {
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
  }
})

const webNewBabelRules = () => ({
  loader: require.resolve('babel-loader'),
  options: {
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
      'react-hot-loader/babel',
      '@loadable/babel-plugin'
    ].map(require.resolve as any)
  }
})

const mergeRegex = (r1: RegExp, r2: RegExp | undefined): RegExp => {
  if (!r2) {
    return r1
  }
  return new RegExp(r1.source + '|' + r2.source)
}

const isRegExp = (a: any): a is RegExp => typeof a.exec === 'function'

const getRegexFromCacheGroup = (name: string, optimization: Configuration['optimization']) => {
  if (
    !optimization ||
    !optimization.splitChunks ||
    !optimization.splitChunks.cacheGroups ||
    typeof optimization.splitChunks.cacheGroups === 'string' ||
    typeof optimization.splitChunks.cacheGroups === 'function' ||
    isRegExp(optimization.splitChunks.cacheGroups)
  ) {
    return
  }
  const cacheGroup = optimization.splitChunks.cacheGroups[name]
  if (!cacheGroup) {
    return
  }
  if (isRegExp(cacheGroup.test)) {
    return cacheGroup.test
  }
}

const webOptimization = ({ optimization }: Configuration): Configuration['optimization'] => ({
  splitChunks: {
    cacheGroups: {
      [pagesRuntimeName]: {
        test: mergeRegex(/react$|react-dom$|@loadable/, getRegexFromCacheGroup(pagesRuntimeName, optimization)),
        reuseExistingChunk: true,
        name: pagesRuntimeName,
        chunks: 'all',
        enforce: true
      },
      [pagesFrameworkName]: {
        test: mergeRegex(/@micro-react$/, getRegexFromCacheGroup(pagesFrameworkName, optimization)),
        reuseExistingChunk: true,
        name: pagesFrameworkName,
        chunks: 'all',
        enforce: true
      }
    }
  }
})
