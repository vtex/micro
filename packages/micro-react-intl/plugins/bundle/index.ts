import {
  BundlePlugin,
  pagesFrameworkName,
  pagesRuntimeName
} from '@vtex/micro-core'
import { cacheGroup } from '@vtex/micro-react/plugins'
import { join } from 'path'
import { babel, Block, Context, group, resolve } from 'webpack-blocks'

import { aliases } from '../aliases'

export default class Bundle extends BundlePlugin {
  public getWebpackConfig = async (config: Block<Context>): Promise<Block<Context>> => {
    return group([
      config,
      babel({
        plugins: [
          [
            require.resolve('babel-plugin-react-intl'), {
              outputEmptyJson: false,
              extractFromFormatMessageCall: true,
              moduleSourceName: '@vtex/micro-react-intl/components',
              messagesDir: join(this.project.dist, this.target, 'messages-per-file')
            }
          ] as any
        ]
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
      cacheGroup(pagesRuntimeName, /\/react-intl\//),
      cacheGroup(pagesFrameworkName, /\/micro-react-intl\//)
    ])
  }
}
