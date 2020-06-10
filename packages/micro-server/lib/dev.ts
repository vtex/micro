import compress from 'compression'
import express from 'express'
import logger from 'morgan'
import { MultiCompiler } from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'

import { RenderCompiler, Project, PublicPaths } from '@vtex/micro-core'

import { RenderHook, resolvePlugins } from './common'
import { middleware as streamAssets } from './middlewares/assets'
import { middleware as respondData } from './middlewares/data'
import { middleware as headers } from './middlewares/headers'
import { middleware as router } from './middlewares/router'
import { devSSR } from './middlewares/ssr'
import { Next, Req, Res } from './typings'

export interface DevServerOptions {
  compiler: MultiCompiler
  project: Project
  publicPaths: PublicPaths
  host: string
  port: number
}

const context = ({
  project,
  plugins,
  publicPaths,
}: {
  project: Project
  plugins: Array<NonNullable<RenderHook>>
  publicPaths: PublicPaths
}) => (req: Req, res: Res, next: Next) => {
  const {
    locals: {
      route: { page, path },
      webpack,
    },
  } = res
  const statsJson = webpack?.devMiddleware?.stats?.toJson()
  res.locals.compiler = new RenderCompiler({
    project,
    plugins,
    options: {
      stats: statsJson,
      mode: 'development',
      lifecycleTarget: 'build',
      publicPaths,
      page,
      path,
    },
  })
  next()
}

export const startDevServer = async ({
  publicPaths,
  compiler,
  project,
  host,
  port,
}: DevServerOptions) => {
  const [renderPlugins, routerPlugins] = await Promise.all([
    resolvePlugins(project, 'render'),
    resolvePlugins(project, 'route'),
  ])

  const routerMiddleware = await router(project, routerPlugins, publicPaths)
  const contextMiddleware = context({
    project,
    plugins: renderPlugins,
    publicPaths,
  })

  const app = express()

  app.use(logger('dev'))
  app.use(compress())

  app.get('/favicon.ico', (req: Req, res: Res) => {
    res.status(404)
    res.send(null)
  })
  app.get(`${publicPaths.assets}*`, headers, streamAssets(project, publicPaths))
  app.get(
    `${publicPaths.data}*`,
    headers,
    routerMiddleware,
    contextMiddleware,
    respondData
  )

  // TODO: Why do we need this as any ?
  app.use(
    webpackDevMiddleware(compiler, {
      serverSideRender: true,
      writeToDisk: true,
      publicPath: publicPaths.assets,
    }),
    headers,
    routerMiddleware,
    contextMiddleware,
    devSSR
  )

  app.listen(port, () => console.log(`🦄 DevServer is UP on ${host}:${port}`))
}
