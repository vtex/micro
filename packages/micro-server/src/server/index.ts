import { Project } from '@vtex/micro'
import { Build } from '@vtex/micro-builder'
import { PublicPaths } from '@vtex/micro-react'
import compress from 'compression'
import express from 'express'
import logger from 'morgan'

import { Extractor } from '../extractor'
import { publicPathFromProject } from '../publicPath'
import { featuresFromReq } from './features'
import { middleware as load } from './middlewares/assets'
import { middleware as headers } from './middlewares/headers'
import { middleware as context } from './middlewares/navigate'
import { middleware as router } from './middlewares/router'
import { middleware as ssr } from './middlewares/ssr'
import { Req, Res, Next } from './typings'

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

const injectState = (build: Build, project: Project, publicPath: PublicPaths) => (req: Req, res: Res, next: Next) => {
  const features = featuresFromReq(req)
  res.locals = {
    features,
    server: new Extractor(build, project, publicPath)
  }
  next()
}

const injectParams = (params: Record<string, string>) => async (req: Req, res: Res, next: Next) => {
  req.params = params
  next()
}

export const startServer = (
  project: Project,
  build: Build,
  port: number,
  host: string
) => {
  const publicPaths = publicPathFromProject(project)

  const app = express()

  app.use(logger(build.production ? 'tiny' : 'dev'))
  app.use(compress())
  app.use(injectState(build, project, publicPaths))

  app.get('/favicon.ico', injectParams({ asset: 'favicon.ico' }), ...assets)
  app.get(`${publicPaths.context}*`, ...navigation)
  app.get(`${publicPaths.assets}:asset`, ...assets)
  app.get('/*', ...render)

  app.listen(port, () => console.log(`🦄 Server is UP on ${host}`))
}
