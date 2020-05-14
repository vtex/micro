import {
  mergeConfigs,
  OnAssembleConfigOptions,
  OnAssemblePlugin,
  pagesFrameworkName,
  pagesRuntimeName,
  Platform
} from '@vtex/micro/framework'
import { Configuration } from 'webpack'

export class OnAssemble extends OnAssemblePlugin {
  public getConfig = ({ configs }: OnAssembleConfigOptions) => {
    const configByPlatform: Record<Platform, Configuration> = {
      nodejs: {},
      webnew: {
        name: 'webnew',
        optimization: {
          ...webOptimization(configs.webnew)
        }
      },
      webold: {
        name: 'webold',
        optimization: {
          ...webOptimization(configs.webnew)
        }
      }
    }

    return mergeConfigs(configs, configByPlatform)
  }
}

const mergeRegex = (r1: RegExp, r2: RegExp | undefined): RegExp => {
  if (!r2) {
    return r1
  }
  return new RegExp(r1.source + '|' + r2.source)
}

const isRegExp = (a: any): a is RegExp => typeof a.exec === 'function'

const getRegexFromCacheGroup = (name: string, optimization: Configuration['optimization']) => {
  if (
    !optimization ||
    !optimization.splitChunks ||
    !optimization.splitChunks.cacheGroups ||
    typeof optimization.splitChunks.cacheGroups === 'string' ||
    typeof optimization.splitChunks.cacheGroups === 'function' ||
    isRegExp(optimization.splitChunks.cacheGroups)
  ) {
    return
  }
  const cacheGroup = optimization.splitChunks.cacheGroups[name]
  if (!cacheGroup) {
    return
  }
  if (isRegExp(cacheGroup.test)) {
    return cacheGroup.test
  }
}

const webOptimization = ({ optimization }: Configuration): Configuration['optimization'] => ({
  splitChunks: {
    cacheGroups: {
      [pagesRuntimeName]: {
        test: mergeRegex(/\/react-router-dom\//, getRegexFromCacheGroup(pagesRuntimeName, optimization)),
        reuseExistingChunk: true,
        name: pagesRuntimeName,
        chunks: 'all',
        enforce: true
      },
      [pagesFrameworkName]: {
        test: mergeRegex(/\/micro-react-router\//, getRegexFromCacheGroup(pagesFrameworkName, optimization)),
        reuseExistingChunk: true,
        name: pagesFrameworkName,
        chunks: 'all',
        enforce: true
      }
    }
  }
})
