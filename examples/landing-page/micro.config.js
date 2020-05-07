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

const router = (path, entrypoints) => {
  if (path === '/') {
    const entry = 'index'
    return {
      entry,
      context: {
        entry
      },
      status: 200,
      path
    }
  } else if (path === '/inverted') {
    const entry = 'index2'
    return {
      entry,
      context: { 
        entry,
        data: {
          a: 2 
        }
      },
      status: 200,
      path
    }
  }
  return {
    status: 404
  }
}

module.exports = () => ({
  webpack,
  router,
})
