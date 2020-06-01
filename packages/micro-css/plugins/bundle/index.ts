import { BundlePlugin } from '@vtex/micro-core'
import { Block, Context, css, group, match } from 'webpack-blocks'

import { extractCss } from './modules/extractCSS'
import { purgeCSS } from './modules/purgeCSS'

export default class Bundle extends BundlePlugin {
  public getConfig = async (config: Block): Promise<Block> => {
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
    ]

    return group([config, ...block])
  }
}
