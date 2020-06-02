import { HtmlCompiler, Project, PublicPaths } from '@vtex/micro-core/lib'
import compress from 'compression'
import express from 'express'
import logger from 'morgan'
import { Stats } from 'webpack'

import { HtmlPlugin, resolvePlugins } from './common'
import { middleware as streamAssets } from './middlewares/assets'
import { middleware as respondData } from './middlewares/data'
import { middleware as headers } from './middlewares/headers'
import { middleware as router } from './middlewares/router'
import { devSSR } from './middlewares/ssr'
import { Next, Req, Res } from './typings'

interface DevServerOptions {
  statsJson: Stats.ToJsonOutput
  project: Project,
  publicPaths: PublicPaths
  host: string
  port: number
}

const context = (
  project: Project,
  plugins: NonNullable<HtmlPlugin>[],
  statsJson: Stats.ToJsonOutput,
  publicPaths: PublicPaths
) => (req: Req, res: Res, next: Next) => {
  const { locals: { route: { page, path } } } = res
  res.locals.compiler = new HtmlCompiler({
    project,
    plugins,
    options: {
      stats: statsJson,
      mode: 'development',
      lifecycleTarget: 'build',
      publicPaths,
      page,
      path
    }
  })
  next()
}

export const startDevServer = async ({
  publicPaths,
  statsJson,
  project,
  host,
  port
}: DevServerOptions) => {
  const plugins = await resolvePlugins(project)
  const htmlPlugins = plugins.map(p => p?.html).filter((p): p is NonNullable<HtmlPlugin> => !!p)

  const routerMiddleware = await router(project, publicPaths)
  const contextMiddleware = context(project, htmlPlugins, statsJson, publicPaths)

  const app = express()

  app.use(logger('dev'))
  app.use(compress())

  app.get('/favicon.ico', (req: Req, res: Res) => { res.status(404); res.send(null) })
  app.get(`${publicPaths.assets}*`, headers, streamAssets(project, publicPaths))
  app.get(`${publicPaths.data}*`, headers, routerMiddleware, contextMiddleware, respondData)
  app.get('/*', headers, routerMiddleware, contextMiddleware, devSSR(publicPaths))

  app.listen(port, () => console.log(`🦄 DevServer is UP on ${host}:${port}`))
}
