// Copied from https://github.com/andywer/webpack-blocks/blob/master/packages/assets/lib/file.js
import { Context, Util } from 'webpack-blocks'

/**
 * @param {object} [options] You can pass all file-loader options.
 * @return {Function}
 * @see https://github.com/webpack-contrib/file-loader
 */
export const file = (options = {}) => {
  return (context: Context, util: Util) => {
    if (!context.match) {
      throw new Error(
        `The file() block can only be used in combination with match(). ` +
          `Use match() to state on which files to apply the file loader.`
      )
    }

    return util.addLoader({
      use: [{ loader: require.resolve('file-loader'), options }],
      ...context.match,
    })
  }
}
