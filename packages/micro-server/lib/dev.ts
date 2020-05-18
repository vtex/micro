import { Project, PublicPaths } from '@vtex/micro'
import compress from 'compression'
import express from 'express'
import logger from 'morgan'

import { middleware as streamAssets } from './middlewares/assets'
import { middleware as respondData } from './middlewares/data'
import { middleware as headers } from './middlewares/headers'
import { middleware as router } from './middlewares/router'
import { devSSR } from './middlewares/ssr'
import { Next, Req, Res } from './typings'

interface DevServerOptions {
  project: Project,
  publicPaths: PublicPaths
  host: string
  port: number
}

const context = (
  project: Project,
  plugins: any,
  publicPaths: PublicPaths
) => (req: Req, res: Res, next: Next) => {
  const { locals: { route: { page, path } } } = res
  res.locals.compiler = {
    project,
    plugins,
    options: {
      mode: 'development',
      publicPaths,
      page,
      path
    }
  } as any
  next()
}

export const startDevServer = async ({
  publicPaths,
  project,
  host,
  port
}: DevServerOptions) => {
  const onRequestPlugins = project.resolvePlugins('onRequest')
  const routerMiddleware = router(project, publicPaths)
  const contextMiddleware = context(project, onRequestPlugins, publicPaths)

  const app = express()

  app.use(logger('dev'))
  app.use(compress())

  app.get(`${publicPaths.assets}*`, headers, streamAssets(project, publicPaths))
  app.get(`${publicPaths.data}*`, headers, routerMiddleware, contextMiddleware, respondData)
  app.get('/*', headers, routerMiddleware, contextMiddleware, devSSR)

  app.listen(port, () => console.log(`🦄 DevServer is UP on ${host}`))
}
