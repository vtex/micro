import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import { Block, css, env, group, match, optimization } from 'webpack-blocks'

import { BundlePlugin } from '@vtex/micro-core/lib'

import { extractCss } from './modules/extractCSS'
import { purgeCSS } from './modules/purgeCSS'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (config: Block): Promise<Block> => {
    const block: Block[] = [
      purgeCSS({
        paths: await this.project.resolveFiles('pages', 'components'),
      }),
      match('*.css', [
        extractCss({
          plugin: { filename: '[name].css' },
          loader: { esModule: true },
        }),
        css({ styleLoader: false } as any),
      ]),
      env('production', [
        optimization({
          minimizer: [
            new OptimizeCSSAssetsPlugin({
              cssProcessorPluginOptions: {
                preset: ['default', { discardComments: { removeAll: true } }],
              },
            }),
          ],
        } as any),
      ]),
    ]

    return group([config, ...block])
  }
}
