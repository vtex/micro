import { Configuration } from 'webpack'
import { Context } from 'webpack-blocks'

const mergeRegex = (r1: RegExp, r2: RegExp | undefined): RegExp => {
  if (!r2) {
    return r1
  }
  return new RegExp(`${r1.source}|${r2.source}`)
}

const isRegExp = (a: any): a is RegExp => typeof a.exec === 'function'

const getRegexFromCacheGroup = (
  name: string,
  optimization: Configuration['optimization']
) => {
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
  if (isRegExp((cacheGroup as any).test)) {
    return (cacheGroup as any).test
  }
}

export const cacheGroup = (name: string, regexp: RegExp) => (
  _: Context,
  util: any
) => (prevConfig: Configuration) => {
  const previousRegexp = getRegexFromCacheGroup(name, prevConfig.optimization)

  return util.merge({
    optimization: {
      splitChunks: {
        cacheGroups: {
          [name]: {
            test: mergeRegex(regexp, previousRegexp),
            reuseExistingChunk: true,
            name,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },
  })(prevConfig)
}
