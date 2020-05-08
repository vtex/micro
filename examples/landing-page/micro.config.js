const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const fetch = require('node-fetch')
const { withRoutingContext } = require('@vtex/micro-router')

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

let stale = null

const staleFetch = async () => {
  if (stale) {
    freshFetch().then(res => stale = res)
    return stale
  }
  stale = await freshFetch()
  return stale
}

const freshFetch = () => fetch(
  "https://storetheme.vtex.com/gorgeous-watch/p?__pickRuntime=appsEtag%2Cblocks%2CblocksTree%2Ccomponents%2CcontentMap%2Cextensions%2Cmessages%2Cpage%2Cpages%2Cquery%2CqueryData%2Croute%2CruntimeMeta%2Csettings", 
  {
    "headers": {
      "accept": "application/json",
      "accept-language": "en-US,en;q=0.9,pt;q=0.8,fr;q=0.7,it;q=0.6,es;q=0.5",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": "vtex_binding_address=storetheme.vtex.com/; checkout.vtex.com=__ofid=70d848fb89be477089f97ea748d60f1c; .ASPXAUTH=0353C37C52727C96296FFD4EC6E8279A433F5309418C5F1EC6BA119544703B0971897A89BC0BEB1F1F341AB2FB3BE6EAAA04D56B7BA83589DA82A2CDE521E1648B22B7C6B39D7617E2C0729203928546A6981838D8ED9267D71D678311E3EF9E314CFC5B55AE6CFB3170AA40E95582F73E68A3A45FA7BEF2D5C58C55B3E1FA108B7072098D2063959D4EDD936FFA81EC9384E368F5F0CA142961F4D5786E44BC02232B30; vtex_session=eyJhbGciOiJFUzI1NiIsImtpZCI6IjI1RThDMTZDREE0QjE3NTI3MzYwN0FDOUM3QTJDREJBMjFDQ0NDREUiLCJ0eXAiOiJqd3QifQ.eyJhY2NvdW50LmlkIjoiN2I2YTJkM2QtZDU5Zi00N2E4LTk5OGQtYWYxNDBmZDFhMWQwIiwiaWQiOiJkMDJjNzc0ZS04YWIzLTQ5NjEtOTE0NS04ZmMwZDQ4YTU0NjMiLCJ2ZXJzaW9uIjoyLCJzdWIiOiJzZXNzaW9uIiwiYWNjb3VudCI6InNlc3Npb24iLCJleHAiOjE1ODkwNDI3NjcsImlhdCI6MTU4ODM1MTU2NywiaXNzIjoidG9rZW4tZW1pdHRlciIsImp0aSI6IjFiYTFkM2Q3LTM5MWYtNGMzZi05NDY5LTBmYTAxNGUzZmM4ZCJ9.KJuJoMjFKDZzU-UQtAF_H1Q0DRFkgToMJLksxiNg6QdlEJYApmbGpXuggDx6ADzUcINrwe4CX_qapt8d5kdUWg; vtex_segment=eyJjYW1wYWlnbnMiOm51bGwsImNoYW5uZWwiOiIxIiwicHJpY2VUYWJsZXMiOm51bGwsInJlZ2lvbklkIjpudWxsLCJ1dG1fY2FtcGFpZ24iOm51bGwsInV0bV9zb3VyY2UiOm51bGwsInV0bWlfY2FtcGFpZ24iOm51bGwsImN1cnJlbmN5Q29kZSI6IlVTRCIsImN1cnJlbmN5U3ltYm9sIjoiJCIsImNvdW50cnlDb2RlIjoiVVNBIiwiY3VsdHVyZUluZm8iOiJlbi1VUyJ9; rsid=7f8aa8ff-d8ab-0a49-597e-8af1b5a07a81; VtexWorkspace=master%3A6bb107ab-c842-419b-a18f-7921b3199416; device=desktop; VtexRCSessionIdv7=0%3A2095bad0-9092-11ea-b400-f946c1bb6b93; VtexRCMacIdv7=209608f0-9092-11ea-b400-f946c1bb6b93; VtexRCRequestCounter=1; _gcl_au=1.1.870843804.1588876787; _ga=GA1.2.1073796337.1588876788; _gid=GA1.2.787874937.1588876788; VtexFingerPrint=4ef405833dbdb57282e59616d75cd290; _gat_UA-121537381-1=1"
    },
    "referrer": "https://storetheme.vtex.com/gorgeous-watch/p",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": null,
    "method": "GET",
    "mode": "cors"
  }).then(res => res.json())

// const freshFetch = () => Promise.resolve('data')
 
const router = async (path, entrypoints) => {
  if (path === '/') {
    return {
      entry: 'index',
      context: await freshFetch(),
      status: 200,
      path
    }
  }

  if (path === '/fresh') {
    return {
      entry: 'index',
      context: await freshFetch(),
      status: 200,
      path
    }
  } 

  if (path === '/stale') {
    return {
      entry: 'index',
      context: await staleFetch(),
      status: 200,
      path
    }
  }

  if (path === '/404') {
    return {
      entry: '404',
      context: await staleFetch(),
      status: 404,
      path
    }
  }

  if (path === '/null') {
    return {
      entry: 'index',
      context: null,
      status: 200,
      path
    }
  }

  if (path === '/about') {
    return {
      entry: 'about',
      context: await staleFetch(),
      status: 200,
      path
    }
  }

  return {
    entry: '404',
    context: null,
    status: 404,
    path,
  }
}

module.exports = () => ({
  webpack,
  router: async (path, entrypoints) => withRoutingContext(await router(path, entrypoints)),
})
