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
import TerserJSPlugin from 'terser-webpack-plugin'
import {
  addPlugins,
  resolve,
  Block,
  Context,
  css,
  env,
  file,
  group,
  match,
  optimization
} from 'webpack-blocks'

import { extractCss } from './modules/extractCSS'
import { purgeCSS } from './modules/purgeCSS'
import { webnewBabel } from './webnew'
import { weboldBabel } from './webold'
import { aliases } from '../aliases'

export default class OnAssemble extends OnAssemblePlugin {
  public getConfig = async (config: Block<Context>, target: AssembleTarget): Promise<Block<Context>> => {
    const block: Block<Context>[] = [
      addPlugins([
        new LoadablePlugin({
          outputAsset: false,
          writeToDisk: false
        })
      ]),
      purgeCSS({
        paths: await this.project.resolveFiles('pages', 'components')
      }),
      resolve({
        alias: aliases.reduce(
          (acc, packageName) => {
            acc[packageName] = require.resolve(packageName)
            return acc
          },
          {} as Record<string, string>
        )
      }),
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
      match(['*.tsx', '*.ts'], [target === 'webnew' ? webnewBabel : weboldBabel])
    ])
  }
}
