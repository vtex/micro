import { babel as babelBlocks, Util } from 'webpack-blocks'

// Code copied from: https://github.com/andywer/webpack-blocks/blob/master/packages/babel/index.js

export const babel: any = (options?: any) =>
  Object.assign(babelBlocks(options), { post: postConfig })

export const postConfig: any = (context: any, util: Util) => {
  const ruleConfig = {
    test: /\.tsx?$/,
    ...context.match,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: context.babel,
      },
    ],
  }
  return util.addLoader(ruleConfig)
}
