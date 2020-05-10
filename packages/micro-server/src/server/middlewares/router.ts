import { webNewTarget } from '@vtex/micro-builder'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from 'express'

import { Next, Req, Res } from '../typings'
import { pathFromRequest } from './../utils/path'

export const middleware = async (req: Req, res: Res, next: Next) => {
  const {
    locals: { server }
  } = res
  const userConfig = server.project.userConfig
  const webNewStats = server.getStatsForTarget(webNewTarget)
  const entries = webNewStats?.entrypoints

  // Should work in / and in /navigate middlewares
  const rootPath = req.path.startsWith(server.publicPaths.context)
    ? server.publicPaths.context
    : '/'
  const path = pathFromRequest(req, rootPath)

  if (userConfig?.router && entries) {
    const { router } = userConfig
    const resolvedEntry = await router(path, entries)

    if (!resolvedEntry) {
      throw new Error(`💣 Entry not resovled for path ${path}`)
    }

    res.locals.server.resolvedEntry = resolvedEntry
  }

  next()
}
