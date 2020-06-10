import assert from 'assert'

import {
  isResolvedPage,
  isResolvedRedirect,
  Project,
  PublicPaths,
  RouteCompiler,
} from '@vtex/micro-core'

import { Next, Req, Res } from '../typings'
import { RouterHook } from '../common'

export const middleware = async (
  project: Project,
  plugins: Array<NonNullable<RouterHook>>,
  publicPaths: PublicPaths
) => {
  assert(
    plugins.length > 0,
    '💣 The project must have a router plugin to be serveable'
  )
  console.log('🐙 [router]: Found router config')
  const router = new RouteCompiler({
    plugins,
    project,
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  })

  return async (req: Req, res: Res, next: Next) => {
    const rootPath = req.path.startsWith(publicPaths!.data)
      ? publicPaths!.data
      : '/'
    const path = req.path.replace(rootPath, '/')

    const page = await router.route({
      path,
      query: req.query as Record<string, string>,
    })

    if (isResolvedRedirect(page)) {
      res.redirect(page.status, page.location)
      return
    }

    if (isResolvedPage(page)) {
      res.locals.route = { page, path }
      return next()
    }

    throw new Error(`💣 Entry not resolved for path ${path}`)
  }
}
