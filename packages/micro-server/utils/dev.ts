import { PublicPaths } from '@vtex/micro/utils'
import { OnRequestCompiler, Project } from '@vtex/micro/framework'
import compress from 'compression'
import express from 'express'
import logger from 'morgan'
import { MultiCompiler, Stats } from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'

import { middleware as respondData } from './middlewares/data'
import { middleware as headers } from './middlewares/headers'
import { middleware as router } from './middlewares/router'
import { middleware as ssr } from './middlewares/ssr'
import { Next, Req, Res } from './typings'

interface DevServerOptions {
  webpack: MultiCompiler
  project: Project,
  publicPaths: PublicPaths
  host: string
  port: number
}

const render = [
  headers,
  ssr
]

const data = [
  headers,
  respondData
]

const mergeStats = (state: Stats.ToJsonOutput, change: Stats[]) => {
  for (const stats of change) {
    const name = stats.compilation.compiler.name
    const statsJson = {
      name,
      ...stats.toJson()
    }
    const index = state.children?.findIndex(c => c.name === name)
    if (state.children && index && index > -1 && index < state.children.length) {
      state.children[index] = statsJson
    } else {
      state.children = [
        ...state.children || [],
        statsJson
      ]
    }
  }
  return state
}

export const startDevServer = async ({
  publicPaths,
  project,
  webpack,
  host,
  port
}: DevServerOptions) => {
  let statsState = {} as Stats.ToJsonOutput
  const webpackConfig = {
    publicPath: publicPaths.assets,
    serverSideRender: true,
    writeToDisk: true,
    index: false
  }
  const onRequestPlugins = project.resolvePlugins('onRequest')

  const app = express()

  app.use(logger('dev'))
  app.use(compress())

  app.use(webpackDevMiddleware(webpack, webpackConfig))
  app.use(router(project, publicPaths))

  app.use((req: Req, res: Res, next: Next) => {
    const { locals: { route: { page, path }, webpackStats } } = res
    statsState = mergeStats(statsState, webpackStats!.stats)
    res.locals.compiler = new OnRequestCompiler({
      project,
      plugins: onRequestPlugins,
      options: {
        stats: statsState,
        mode: 'development',
        publicPaths,
        page,
        path
      }
    })
    next()
  })

  app.get(`${publicPaths.data}*`, ...data)
  app.get('/*', ...render)

  app.listen(port, () => console.log(`🦄 Server is UP on ${host}`))
}
