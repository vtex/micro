import { webNewTarget } from '@vtex/micro-builder'
import { Next } from 'koa'

import { Context } from '../typings'

export const middleware = async (ctx: Context, next: Next) => {
  const {
    state: { server }
  } = ctx
  const userConfig = server.project.userConfig
  const webNewStats = server.getStatsForTarget(webNewTarget)
  const entries = webNewStats?.entrypoints
  
  // Should work in / and in /navigate middlewares
  const path = `/${ctx.params.path || ''}`
  
  if (userConfig?.router && entries) {
    const { router } = userConfig
    const resolvedEntry = router(path, entries)

    if (!resolvedEntry) {
      throw new Error(`💣 Entry not resovled for path ${path}`)
    }

    ctx.state.server.resolvedEntry = resolvedEntry
  }
    
  await next()
}
