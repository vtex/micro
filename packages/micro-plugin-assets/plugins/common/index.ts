import { Block, match } from 'webpack-blocks'

import { file } from './file'

export const assetsWebpackConfig = (): Block[] => [
  match(
    ['*.png', '*.svg', '*.jpg', '*.gif', '*.ico'],
    [
      file({
        name: '[name].[ext]',
      }),
    ]
  ),
]
