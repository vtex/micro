// import MiniCssExtractPlugin from 'mini-css-extract-plugin'
// import { join } from 'path'
// import PurgeCSSPlugin from 'purgecss-webpack-plugin'
// import { Configuration } from 'webpack'
// import WebpackMessagesPlugin from 'webpack-messages'

// import { excludeFromModules, WebpackBuildConfig } from './utils'

// export const target = 'web-old'

// export const toBuildPath = (baseRoot: string) => join(baseRoot, target)

// export const prod = ({
//   root: buildDir, 
//   project: { files },
// }: WebpackBuildConfig): Configuration => {

//   return {
//     /** Enable production optimizations or development hints. */
//     // mode: "production",
//     /** Name of the configuration. Used when loading multiple configurations. */
//     name: target,
//     /**
//      * The base directory (absolute path!) for resolving the `entry` option.
//      * If `output.pathinfo` is set, the included pathinfo is shortened to this directory.
//      */
//     // context: projectPath,
//     // entry: './react/index.tsx',
//     /** Choose a style of source mapping to enhance the debugging process. These values can affect build and rebuild speed dramatically. */
//     // devtool?: Options.Devtool;
//     /** Options affecting the output. */
//     output: {
//       path: toBuildPath(buildDir),
//       publicPath: ASSETS_PATH,
//     },
//     /** Options affecting the normal modules (NormalModuleFactory) */
//     module: {
//       rules: [
//         {
//           test: /\.tsx?$/,
//           exclude: excludeFromModules(files),
//           use: {
//             loader: 'babel-loader',
//             options: {
//               caller: { target },
//               presets: [
//                 ['@babel/preset-env', {
//                   targets: {
//                     browsers: 'cover 99.5%'
//                   }
//                 }],
//                 '@babel/preset-react',
//                 [
//                   '@babel/preset-typescript', {
//                     isTSX: true,
//                     allExtensions: true
//                   }
//                 ]
//               ],
//               plugins: [
//                 '@babel/plugin-proposal-class-properties',
//                 '@babel/plugin-syntax-dynamic-import',
//                 '@loadable/babel-plugin'
//               ]
//             },
//           }
//         },
//       ]
//     },
//     /** Options affecting the resolving of modules. */
//     // resolve: {
//     //   extensions: ['.tsx', '.ts', '.js', '.jsx'],
//     //   modules: [
//     //     join(projectPath, 'node_modules'),
//     //     join(projectPath, 'node_modules/micro/node_modules')
//     //   ]
//     // },
//     /** Like resolve but for loaders. */
//     // resolveLoader?: ResolveLoader;
//     /**
//      * Specify dependencies that shouldn’t be resolved by webpack, but should become dependencies of the resulting bundle.
//      * The kind of the dependency depends on output.libraryTarget.
//      */
//     // externals?: ExternalsElement | ExternalsElement[];
//     /**
//      * - "web" Compile for usage in a browser-like environment (default).
//      * - "webworker" Compile as WebWorker.
//      * - "node" Compile for usage in a node.js-like environment (use require to load chunks).
//      * - "async-node" Compile for usage in a node.js-like environment (use fs and vm to load chunks async).
//      * - "node-webkit" Compile for usage in webkit, uses jsonp chunk loading but also supports builtin node.js modules plus require(“nw.gui”) (experimental)
//      * - "atom" Compile for usage in electron (formerly known as atom-shell), supports require for modules necessary to run Electron.
//      * - "electron-renderer" Compile for Electron for renderer process, providing a target using JsonpTemplatePlugin, FunctionModulePlugin for browser
//      *   environments and NodeTargetPlugin and ExternalsPlugin for CommonJS and Electron built-in modules.
//      * - "electron-preload" Compile for Electron for renderer process, providing a target using NodeTemplatePlugin with asyncChunkLoading set to true,
//      *   FunctionModulePlugin for browser environments and NodeTargetPlugin and ExternalsPlugin for CommonJS and Electron built-in modules.
//      * - "electron-main" Compile for Electron for main process.
//      * - "atom" Alias for electron-main.
//      * - "electron" Alias for electron-main.
//      */
//     target: 'web',
//     /** Report the first error as a hard error instead of tolerating it. */
//     // bail: true,
//     /** Capture timing information for each module. */
//     // profile: true,
//     /** Cache generated modules and chunks to improve performance for multiple incremental builds. */
//     // cache?: boolean | object;
//     /** Enter watch mode, which rebuilds on file change. */
//     // watch?: boolean;
//     // watchOptions?: Options.WatchOptions;
//     /** Include polyfills or mocks for various node stuff */
//     // node: false,
//     /** Set the value of require.amd and define.amd. */
//     // amd?: { [moduleName: string]: boolean };
//     /** Used for recordsInputPath and recordsOutputPath */
//     // recordsPath?: string;
//     /** Load compiler state from a json file. */
//     // recordsInputPath?: string;
//     /** Store compiler state to a json file. */
//     // recordsOutputPath?: string;
//     /** Add additional plugins to the compiler. */
//     plugins: [
//       new WebpackMessagesPlugin({
//         name: target,
//         logger: (str: any) => console.log(`>> ${str}`)
//       }),
//       new MiniCssExtractPlugin({
//         filename: "[name].css",
//       }),
//       new PurgeCSSPlugin({
//         paths: files,
//       }),
//     ],
//     /** Stats options for logging  */
//     // stats?: Options.Stats;
//     /** Performance options */
//     // performance?: Options.Performance | false;
//     /** Limit the number of parallel processed modules. Can be used to fine tune performance or to get more reliable profiling results */
//     // parallelism?: number;
//     /** Optimization options */
//     // optimization: {
//     //   minimizer: [
//     //     new TerserJSPlugin({
//     //       extractComments: true
//     //     }),
//     //     new OptimizeCSSAssetsPlugin({
//     //       cssProcessorPluginOptions: {
//     //         preset: ['default', { discardComments: { removeAll: true } }],
//     //       },
//     //     })
//     //   ],
//     // },
//   }
// }
