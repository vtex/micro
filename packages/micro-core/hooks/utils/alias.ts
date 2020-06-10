import { Context, Util } from 'webpack-blocks'

// TODO: fix this any in module
export const alias = (aliases: string[], module: any) => (
  _: Context,
  util: Util // TODO: fix this any
) =>
  util.merge({
    resolve: {
      alias: aliases.reduce((acc, a) => {
        acc[a] = require.resolve(a, { paths: module.paths })
        return acc
      }, {} as Record<string, string>),
    },
  })
