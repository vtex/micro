const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const { staticRouter } = require('@vtex/micro-router')

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

const fetchData = () => {
  console.log('Here you should fetch')
  return {
    a: 1
  }
}
 
const routes = [
  {
    entry: 'about',
    loadContext: () => fetchData(),
    status: 200,
    path: '/about'
  },
  {
    entry: '404',
    loadContext: () => null,
    status: 404,
    path: '/404',
  }, 
  {
    entry: 'index',
    loadContext: ({params: { selector }}) => {
      if (selector === 'fresh') {
        return fetchData()
      } else {
        return fetchData()
      }
    },
    status: 200,
    path: '/:selector'
  },
  {
    entry: 'index',
    loadContext: () => fetchData(),
    status: 200,
    path: '/'
  },
]

module.exports = () => ({
  webpack,
  router: staticRouter(routes),
})
