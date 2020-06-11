import compress from 'compression'
import express from 'express'
import logger from 'morgan'

import { Project, PublicPaths, RenderCompiler, walk } from '@vtex/micro-core'

import { RenderHook, resolvePlugins } from './common'
import { middleware as streamAssets } from './middlewares/assets'
import { middleware as respondData } from './middlewares/data'
import { middleware as headers } from './middlewares/headers'
import { middleware as router } from './middlewares/router'
import { middleware as ssr } from './middlewares/ssr'
import { Next, Req, Res } from './typings'

export interface ProdServerOptions {
  statsJson: any // TODO: fix this as any
  project: Project
  publicPaths: PublicPaths
  host: string
  port: number
}

const context = ({
  project,
  plugins,
  statsJson,
  publicPaths,
}: {
  project: Project
  plugins: Array<NonNullable<RenderHook>>
  statsJson: any
  publicPaths: PublicPaths
}) => (req: Req, res: Res, next: Next) => {
  const {
    locals: {
      route: { page, path },
    },
  } = res
  res.locals.compiler = new RenderCompiler({
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
  const [renderPlugins, routerPlugins] = await Promise.all([
    resolvePlugins(project, 'render'),
    resolvePlugins(project, 'route'),
  ])

  // DFS to require all bundles needed to SSR
  await walk(project.root, async (curr, p) => {
    // We don't need to require the root project
    if (p === null) {
      return
    }
    await curr.getHook('components' as any)
  })

  const routerMiddleware = await router(project, routerPlugins, publicPaths)
  const contextMiddleware = context({
    project,
    plugins: renderPlugins,
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
