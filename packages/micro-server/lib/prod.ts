import { HtmlCompiler, Project, PublicPaths } from '@vtex/micro-core/lib'
import compress from 'compression'
import express from 'express'
import logger from 'morgan'

import { HtmlPlugin, resolvePlugins, RouterPlugin } from './common'
import { middleware as streamAssets } from './middlewares/assets'
import { middleware as respondData } from './middlewares/data'
import { middleware as headers } from './middlewares/headers'
import { middleware as router } from './middlewares/router'
import { middleware as ssr } from './middlewares/ssr'
import { Next, Req, Res } from './typings'

interface ProdServerOptions {
  statsJson: any // TODO: fix this as any
  project: Project
  publicPaths: PublicPaths
  host: string
  port: number
}

const context = (
  project: Project,
  plugins: NonNullable<HtmlPlugin>[],
  statsJson: any,
  publicPaths: PublicPaths
}) => (req: Req, res: Res, next: Next) => {
  const {
    locals: {
      route: { page, path },
    },
  } = res
  res.locals.compiler = new HtmlCompiler({
    project,
    plugins,
    options: {
      stats: statsJson,
      mode: 'production',
      lifecycleTarget: 'bundle',
      publicPaths,
      page,
      path,
    },
  })
  next()
}

export const startProdServer = async ({
  publicPaths,
  statsJson,
  project,
  host,
  port,
}: ProdServerOptions) => {
  const plugins = await resolvePlugins(project)
  const htmlPlugins = plugins
    .map((p) => p?.html)
    .filter((p): p is NonNullable<HtmlPlugin> => !!p)
  const routerPlugins = plugins
    .map((p) => p?.router)
    .filter((p): p is NonNullable<RouterPlugin> => !!p)

  const routerMiddleware = await router(project, routerPlugins, publicPaths)
  const contextMiddleware = context({
    project,
    plugins: htmlPlugins,
    statsJson,
    publicPaths,
  })

  const app = express()

  app.use(logger('tiny'))
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
  app.get('/*', headers, routerMiddleware, contextMiddleware, ssr)

  app.listen(port, () => console.log(`🦄 ProdServer is UP on ${host}:${port}`))
}
