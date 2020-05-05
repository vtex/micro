const PurgeCSSPlugin = require('purgecss-webpack-plugin')

const findPurgeCSSPlugin = (plugins) => plugins.findIndex(plugin => plugin.purgedStats && plugin.options)

const webpack = (config) => {
  // Adds whitelisted CSS rules to purgeCSSPlugin
  const { plugins } = config
  const index = findPurgeCSSPlugin(plugins)

  const { options: { paths } } = plugins[index]

  plugins[index] = new PurgeCSSPlugin({
    paths,
    whitelistPatterns: () => [
      /^(?!uk-).*/,
    ]
  })
  return config
}


module.exports = () => ({
  webpack,
  module,
})