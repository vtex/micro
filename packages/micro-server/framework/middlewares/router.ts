import { PublicPaths } from '@vtex/micro'
import {
  isResolvedPage,
  isResolvedRedirect,
  Project,
  Router
} from '@vtex/micro/framework'

import express, { Next, Req, Res } from '../typings'

const ensureRouter = (router: Router | undefined) => {
  if (typeof router !== 'function') {
    throw new Error('💣 No router found for package')
  }
  console.log('🐙 [router]: Found router config')
  return router
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const middleware = (project: Project, publicPaths: PublicPaths) => {
  const router = ensureRouter(project.getRouter())

  return async (req: Req, res: Res, next: Next) => {
    const rootPath = req.path.startsWith(publicPaths!.data)
      ? publicPaths!.data
      : '/'
    const path = req.path.replace(rootPath, '/')

    const page = await router({ path }, {})

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
