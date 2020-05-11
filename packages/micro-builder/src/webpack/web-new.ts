import CopyPlugin from 'copy-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { basename, join } from 'path'
import PurgeCSSPlugin from 'purgecss-webpack-plugin'
import { Configuration, HotModuleReplacementPlugin } from 'webpack'
import DynamicPublicPathPlugin from 'webpack-dynamic-public-path'
import MessagesPlugin from 'webpack-messages'
import TimeFixPlugin from 'time-fix-plugin'

import {
  excludeFromModules,
  publicPathFromProject,
  WebpackBuildConfig
} from './utils'

export const target = 'web-new'

export const toBuildPath = (baseRoot: string) => join(baseRoot, target)

const entriesFromPages = (pages: string[], production: boolean) => pages.reduce(
  (acc, path) => {
    const name = basename(path, '.tsx')
    acc[name] = !production
      ? [require.resolve('react-hot-loader/patch'), path, require.resolve('webpack-hot-middleware/client') + '?path=/__webpack_hmr&timeout=20000&reload=true']
      : [path]
    return acc
  },
  {} as Record<string, string[]>
)

export const prod = ({
  root: buildDir,
  project,
  project: { files, root, pages },
  publicPath: {
    variable
  },
  runtime: {
    name: runtimeName,
    test: runtimeTest
  },
  framework: {
    name: frameworkName,
    test: frameworkTest
  }
}: WebpackBuildConfig): Configuration => {
  return {
    /** Enable production optimizations or development hints. */
    // mode: "production",
    /** Name of the configuration. Used when loading multiple configurations. */
    name: target,
    /**
     * The base directory (absolute path!) for resolving the `entry` option.
     * If `output.pathinfo` is set, the included pathinfo is shortened to this directory.
     */
    // context: projectPath,
    entry: entriesFromPages(pages, true),
    /** Choose a style of source mapping to enhance the debugging process. These values can affect build and rebuild speed dramatically. */
    // devtool?: Options.Devtool;
    /** Options affecting the output. */
    output: {
      path: toBuildPath(buildDir),
      publicPath: publicPathFromProject(project).assets
    },
    /** Options affecting the normal modules (NormalModuleFactory) */
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: excludeFromModules(files),
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              caller: { target },
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
          }
        }
      ]
    },
    /** Options affecting the resolving of modules. */
    // resolve: {
    //   extensions: ['.tsx', '.ts', '.js', '.jsx'],
    //   modules: [
    //     join(projectPath, 'node_modules'),
    //     join(projectPath, 'node_modules/micro/node_modules')
    //   ]
    // },
    /** Like resolve but for loaders. */
    // resolveLoader?: ResolveLoader;
    /**
     * Specify dependencies that shouldn’t be resolved by webpack, but should become dependencies of the resulting bundle.
     * The kind of the dependency depends on output.libraryTarget.
     */
    // externals?: ExternalsElement | ExternalsElement[];
    /**
     * - "web" Compile for usage in a browser-like environment (default).
     * - "webworker" Compile as WebWorker.
     * - "node" Compile for usage in a node.js-like environment (use require to load chunks).
     * - "async-node" Compile for usage in a node.js-like environment (use fs and vm to load chunks async).
     * - "node-webkit" Compile for usage in webkit, uses jsonp chunk loading but also supports builtin node.js modules plus require(“nw.gui”) (experimental)
     * - "atom" Compile for usage in electron (formerly known as atom-shell), supports require for modules necessary to run Electron.
     * - "electron-renderer" Compile for Electron for renderer process, providing a target using JsonpTemplatePlugin, FunctionModulePlugin for browser
     *   environments and NodeTargetPlugin and ExternalsPlugin for CommonJS and Electron built-in modules.
     * - "electron-preload" Compile for Electron for renderer process, providing a target using NodeTemplatePlugin with asyncChunkLoading set to true,
     *   FunctionModulePlugin for browser environments and NodeTargetPlugin and ExternalsPlugin for CommonJS and Electron built-in modules.
     * - "electron-main" Compile for Electron for main process.
     * - "atom" Alias for electron-main.
     * - "electron" Alias for electron-main.
     */
    target: 'web',
    /** Report the first error as a hard error instead of tolerating it. */
    // bail: true,
    /** Capture timing information for each module. */
    // profile: true,
    /** Cache generated modules and chunks to improve performance for multiple incremental builds. */
    // cache?: boolean | object;
    /** Enter watch mode, which rebuilds on file change. */
    // watch?: boolean;
    // watchOptions?: Options.WatchOptions;
    /** Include polyfills or mocks for various node stuff */
    node: false,
    /** Set the value of require.amd and define.amd. */
    // amd?: { [moduleName: string]: boolean };
    /** Used for recordsInputPath and recordsOutputPath */
    // recordsPath?: string;
    /** Load compiler state from a json file. */
    // recordsInputPath?: string;
    /** Store compiler state to a json file. */
    // recordsOutputPath?: string;
    /** Add additional plugins to the compiler. */
    plugins: [
      new TimeFixPlugin(),
      // new HotModuleReplacementPlugin(),
      new MessagesPlugin({
        name: target,
        logger: (str: any) => console.log(`>> ${str}`)
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new PurgeCSSPlugin({
        paths: files
      }),
      new DynamicPublicPathPlugin({
        externalPublicPath: variable
      }),
      // Plugin to Copy Favicon.ico
      new CopyPlugin([
        { from: join(root, 'assets/favicon.ico'), to: toBuildPath(buildDir) }
      ])
    ],
    /** Stats options for logging  */
    // stats?: Options.Stats;
    /** Performance options */
    // performance?: Options.Performance | false;
    /** Limit the number of parallel processed modules. Can be used to fine tune performance or to get more reliable profiling results */
    // parallelism?: number;
    /** Optimization options */
    optimization: {
      runtimeChunk: {
        name: runtimeName
      },
      splitChunks: {
        maxInitialRequests: 30,
        maxAsyncRequests: 10,
        cacheGroups: {
          [runtimeName]: {
            test: runtimeTest,
            reuseExistingChunk: true,
            name: runtimeName,
            chunks: 'all',
            enforce: true
          },
          [frameworkName]: {
            test: frameworkTest,
            reuseExistingChunk: true,
            name: frameworkName,
            chunks: 'all',
            enforce: true
          }
        }
      },
      noEmitOnErrors: true,
      namedModules: false,
      namedChunks: false,
      moduleIds: 'size',
      chunkIds: 'total-size',
      nodeEnv: 'production',
      removeAvailableModules: true,
      removeEmptyChunks: true,
      mergeDuplicateChunks: true,
      flagIncludedChunks: true,
      occurrenceOrder: true,
      providedExports: true,
      usedExports: true,
      concatenateModules: true,
      sideEffects: true,
      portableRecords: false
    }
  }
}

export const dev = (config: WebpackBuildConfig): Configuration => {
  const prodConf = prod(config)
  const {
    root: buildDir,
    project: { files, root, pages },
    publicPath: {
      variable
    }
  } = config

  return {
    ...prodConf,
    mode: 'development',
    entry: entriesFromPages(pages, false),
    plugins: [
      new TimeFixPlugin(),
      new HotModuleReplacementPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new PurgeCSSPlugin({
        paths: files
      }),
      new DynamicPublicPathPlugin({
        externalPublicPath: variable
      }),
      // Plugin to Copy Favicon.ico
      new CopyPlugin([
        { from: join(root, 'assets/favicon.ico'), to: toBuildPath(buildDir) }
      ])
    ],
    resolve: {
      alias: {
        'react-dom': require.resolve('@hot-loader/react-dom'),
        'react-hot-loader/root': require.resolve('react-hot-loader/root'),
        'react-hot-loader': require.resolve('react-hot-loader')
      }
    },
    optimization: {}
  }
}
