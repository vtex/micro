import { Project } from '@vtex/micro'
import { Build } from '@vtex/micro-builder'
import { PublicPaths } from '@vtex/micro-react'
import Koa, { Context, Next } from 'koa'
import compress from 'koa-compress'
import logger from 'koa-logger'
import Router from 'koa-router'

import { Extractor } from '../extractor'
import { publicPathFromProject } from '../publicPath'
import { featuresFromCtx } from './features'
import { middleware as load } from './middlewares/assets'
import { middleware as headers } from './middlewares/headers'
import { middleware as ssr } from './middlewares/ssr'
import { middleware as router } from './middlewares/router'
import { middleware as context } from './middlewares/navigate'

const render = [
  headers,
  router,
  ssr
]

const assets = [
  headers,
  load
]

const navigation = [
  headers,
  router,
  context
]

const injectState = (build: Build, project: Project, publicPath: PublicPaths) => async (ctx: Context, next: Next) => {
  const features = featuresFromCtx(ctx)
  ctx.state = {
    features,
    server: new Extractor(build, project, publicPath)
  }
  await next()
}

const injectParams = (params: Record<string, string>) => async (ctx: Context, next: Next) => {
  ctx.params = params
  await next()
}

export const startServer = (
  project: Project,
  build: Build,
  port: number,
  host: string
) => {
  const publicPaths = publicPathFromProject(project)

  const app = new Koa()

  const router = new Router()

  app.use(logger())
  app.use(compress())
  app.use(injectState(build, project, publicPaths))

  router.get('/favicon.ico', injectParams({ asset: 'favicon.ico' }), ...assets)
  router.get(`${publicPaths.context}:path*`, ...navigation)
  router.get(`${publicPaths.assets}:asset`, ...assets)
  router.get('/:path*', ...render)

  app.use(router.routes())
  app.use(router.allowedMethods())
  app.listen(port, () => console.log(`🦄 Server is UP on ${host}`))
}
