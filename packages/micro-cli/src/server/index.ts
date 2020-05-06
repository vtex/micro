import Koa, { Context, Next } from 'koa'
import compress from 'koa-compress'
import logger from 'koa-logger'
import Router from 'koa-router'
import { Stats } from 'webpack'

import { HOST, PROTOCOL } from '../constants'
import { Project } from './../project'
import { MicroServerConfig } from './config'
import { middleware as load } from './middlewares/assets'
import { middleware as features } from './middlewares/features'
import { middleware as headers } from './middlewares/headers'
import { middleware as ssr } from './middlewares/ssr'

const render = [
  features,
  headers,
  ssr,
]

const assets = [
  features,
  headers,
  load,
]

const injectState = (project: Project, server: MicroServerConfig, stats: Stats.ToJsonOutput) => async (ctx: Context, next: Next) => {
  ctx.state = {
    stats,
    project,
    server
  }
  await next()
}

export const startServer = async (project: Project, stats: Stats.ToJsonOutput, port: number) => {
  const server = new MicroServerConfig()
  const app = new Koa()
  
  const router = new Router
  
  app.use(logger())
  app.use(compress())
  app.use(injectState(project, server, stats))

  router.get(`${server.assetsBasePath}:asset`, ...assets)
  router.get('*', ...render)

  app.use(router.routes())
  app.use(router.allowedMethods())
  app.listen(port, () => console.log(`🦄 Server is UP on port ${PROTOCOL}://${HOST}`))
}