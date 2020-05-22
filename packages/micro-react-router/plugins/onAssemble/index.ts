import {
  cacheGroup,
  OnAssemblePlugin,
  pagesFrameworkName,
  pagesRuntimeName
} from '@vtex/micro'
import { Block, Context, group } from 'webpack-blocks'

export default class OnAssemble extends OnAssemblePlugin {
  public getConfig = async (config: Block<Context>): Promise<Block<Context>> => {
    return group([
      config,
      cacheGroup(pagesRuntimeName, /\/react-router-dom\//),
      cacheGroup(pagesFrameworkName, /\/micro-react-router\//)
    ])
  }
}
