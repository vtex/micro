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

const loadDepOrBrandContext = ({ params: { search }}) => {
  if (search === 'brand') {
    return {
      name: 'My Awesome Brand'
    }
  }
  if (search === 'department') {
    return {
      name: 'My Awesome Department'
    }
  }
  throw new Error('💣 depOrBrand not found')
}
 
const logContext = msg => () => {
  console.log(msg)
  return null
}

const routes = [
  {
    entry: 'about',
    loadContext: logContext('about'),
    status: 200,
    path: '/about'
  },
  {
    entry: 'product',
    loadContext: logContext('product'),
    status: 200,
    exact: true,
    path: '/:slug/p',
  }, 
  {
    entry: 'search',
    loadContext: logContext('/:deparment/:category'),
    status: 200,
    exact: true,
    path: '/:deparment/:category',
  },
  {
    entry: 'search',
    loadContext: loadDepOrBrandContext,
    status: 200,
    exact: true,
    path: '/:search',
  }, 
  {
    entry: 'index',
    loadContext: logContext('index'),
    status: 200,
    exact: true,
    path: '/'
  },
  {
    entry: '404',
    loadContext: logContext('404'),
    status: 404,
    path: '/',
  },
]

module.exports = () => ({
  webpack,
  router: staticRouter(routes),
})
