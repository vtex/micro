import { OnRequestCompiler, Project, PublicPaths } from '@vtex/micro'
import compress from 'compression'
import express from 'express'
import logger from 'morgan'
import { Stats } from 'webpack'

import { middleware as streamAssets } from './middlewares/assets'
import { middleware as respondData } from './middlewares/data'
import { middleware as headers } from './middlewares/headers'
import { middleware as router } from './middlewares/router'
import { middleware as ssr } from './middlewares/ssr'
import { Next, Req, Res } from './typings'

interface ProdServerOptions {
  statsJson: Stats.ToJsonOutput
  project: Project,
  publicPaths: PublicPaths
  host: string
  port: number
}

const context = (
  project: Project,
  plugins: any,
  statsJson: Stats.ToJsonOutput,
  publicPaths: PublicPaths
) => (req: Req, res: Res, next: Next) => {
  const { locals: { route: { page, path } } } = res
  res.locals.compiler = new OnRequestCompiler({
    project,
    plugins,
    options: {
      stats: statsJson,
      mode: 'development',
      publicPaths,
      page,
      path
    }
  })
  next()
}

export const startProdServer = async ({
  publicPaths,
  statsJson,
  project,
  host,
  port
}: ProdServerOptions) => {
  const onRequestPlugins = project.resolvePlugins('onRequest')
  const routerMiddleware = router(project, publicPaths)
  const contextMiddleware = context(project, onRequestPlugins, statsJson, publicPaths)

  const app = express()

  app.use(logger('tiny'))
  app.use(compress())

  app.get(`${publicPaths.assets}*`, headers, streamAssets(project, publicPaths))
  app.get(`${publicPaths.data}*`, headers, routerMiddleware, contextMiddleware, respondData)
  app.get('/*', headers, routerMiddleware, contextMiddleware, ssr)

  app.listen(port, () => console.log(`🦄 Server is UP on ${host}`))
}
