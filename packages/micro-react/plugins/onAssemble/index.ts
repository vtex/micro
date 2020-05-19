import LoadablePlugin from '@loadable/webpack-plugin'
import {
  AssembleTarget,
  cacheGroup,
  externalPublicPathVariable,
  OnAssemblePlugin,
  pagesFrameworkName,
  pagesRuntimeName
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
import { webnewBabel } from './webnew'
import { weboldBabel } from './webold'

export class OnAssemble extends OnAssemblePlugin {
  public getConfig = async (config: Block<Context>, target: AssembleTarget): Promise<Block<Context>> => {
    const block: Block<Context>[] = [
      addPlugins([
        new LoadablePlugin({
          outputAsset: false,
          writeToDisk: false
        }),
        new PurgeCSSPlugin({
          paths: await this.project.resolveFiles('pages', 'components')
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
      cacheGroup(pagesFrameworkName, /\/micro-react\/components\//),
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
      ])
    ]

    return group([
      config,
      ...block,
      addPlugins([
        new MessagesPlugin({
          name: target,
          logger: (str: any) => console.log(`>> ${str}`)
        })
      ]),
      match(['*.tsx', '*.ts'], [target === 'webnew' ? webnewBabel : weboldBabel])
    ])
  }
}
