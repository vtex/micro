import LoadablePlugin from '@loadable/webpack-plugin'
import {
  externalPublicPathVariable,
  OnAssembleConfigOptions,
  OnAssemblePlugin,
  pagesFrameworkName,
  pagesRuntimeName,
  Platform,
  cacheGroup
} from '@vtex/micro'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import PurgeCSSPlugin from 'purgecss-webpack-plugin'
import TerserJSPlugin from 'terser-webpack-plugin'
import {
  addPlugins,
  Block,
  Context,
  css,
  customConfig,
  env,
  file,
  group,
  match,
  optimization
} from 'webpack-blocks'
import MessagesPlugin from 'webpack-messages'

import { extractCss } from './modules/extractCSS'
import { nodejsBabel } from './nodejs'
import { webnewBabel } from './webnew'
import { weboldBabel } from './webold'

export class OnAssemble extends OnAssemblePlugin {
  public getConfig = ({ configs, project }: OnAssembleConfigOptions): Record<Platform, Block<Context>> => {
    const common: Block<Context>[] = [
      addPlugins([
        new LoadablePlugin({
          outputAsset: false,
          writeToDisk: false
        }),
        new PurgeCSSPlugin({
          paths: project.resolveFiles('pages|components')
        })
      ]),
      customConfig({
        stats: {
          hash: true,
          publicPath: true,
          assets: true,
          chunks: false,
          modules: false,
          source: false,
          errorDetails: false,
          timings: false
        }
      }) as Block<Context>,
      env('production', [
        optimization({
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
        })
      ]),
      match('*.css', [
        extractCss({
          plugin: { filename: '[name].css' },
          loader: { esModule: true }
        }),
        css({ styleLoader: false } as any)
      ]),
      match(['*.png', '*.svg', '*.jpg', '*.gif'], [
        file({ publicPath: externalPublicPathVariable })
      ]),
      cacheGroup(pagesRuntimeName, /\/react\/|\/react-dom\/|\/@loadable\//),
      cacheGroup(pagesFrameworkName, /\/micro-react\/components\//)
    ]

    return {
      nodejs: group([
        configs.nodejs,
        ...common,
        addPlugins([
          new MessagesPlugin({
            name: 'nodejs',
            logger: (str: any) => console.log(`>> ${str}`)
          })
        ]),
        match(['*.tsx', '*.ts'], [
          nodejsBabel
        ])
      ]),
      webnew: group([
        configs.webnew,
        ...common,
        addPlugins([
          new MessagesPlugin({
            name: 'webnew',
            logger: (str: any) => console.log(`>> ${str}`)
          })
        ]),
        match(['*.tsx', '*.ts'], [
          webnewBabel
        ])
      ]),
      webold: group([
        configs.webold,
        ...common,
        addPlugins([
          new MessagesPlugin({
            name: 'webold',
            logger: (str: any) => console.log(`>> ${str}`)
          })
        ]),
        match(['*.tsx', '*.ts'], [
          weboldBabel
        ])
      ])
    }
  }
}
