import {
  cacheGroup,
  OnAssemblePlugin,
  pagesFrameworkName,
  pagesRuntimeName
} from '@vtex/micro'
import { Block, Context, group, resolve } from 'webpack-blocks'

export default class OnAssemble extends OnAssemblePlugin {
  public getConfig = async (config: Block<Context>): Promise<Block<Context>> => {
    return group([
      config,
      resolve({
        alias: { // make react imports always to fallback to this one
          history: require.resolve('history'),
          'react-router-dom': require.resolve('react-router-dom')
        }
      }),
      cacheGroup(pagesRuntimeName, /\/react-in-viewport\/|\/react-router\/|\/react-router-dom\//),
      cacheGroup(pagesFrameworkName, /\/micro-react-router\//)
    ])
  }
}
