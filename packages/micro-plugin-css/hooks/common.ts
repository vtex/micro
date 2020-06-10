import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import { Block, css, env, match, optimization } from 'webpack-blocks'

import { Project } from '@vtex/micro-core'

import { extractCss } from './bundle/modules/extractCSS'
import { purgeCSS } from './bundle/modules/purgeCSS'

export const cssWebpackConfig = async (project: Project): Promise<Block[]> => [
  purgeCSS({
    paths: await project.resolveFiles('pages', 'components'),
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
