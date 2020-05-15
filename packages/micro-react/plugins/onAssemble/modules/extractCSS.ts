// eslint-disable-next-line @typescript-eslint/no-unused-vars
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { Context, Util } from 'webpack-blocks'

interface Options {
  loader?: {
    esModule: boolean
  },
  plugin?: MiniCssExtractPlugin.PluginOptions
}

export const extractCss = (options?: Options) => (context: Context, { merge }: Util) => merge({
  module: {
    rules: [
      {
        test: /\.css$/,
        ...context.match,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: options?.loader
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(options?.plugin)
  ]
})
