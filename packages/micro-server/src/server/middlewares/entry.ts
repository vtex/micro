import { webNewTarget } from '@vtex/micro-builder'
import { Next } from 'koa'

import { Context } from '../typings'

export const middleware = async (ctx: Context, next: Next) => {
  const {
    state: { server },
    params: { entry }
  } = ctx

  console.log('in here')

  if (!entry) {
    throw new Error('💣 Could not find entrypoint')
  }

  const stats = server.getStatsForTarget(webNewTarget)
  const entrypoint = stats?.entrypoints?.[entry]

  if (!entrypoint) {
    throw new Error(`💣 Could not find entrypoint ${entry} in stats`)
  }

  ctx.body = entrypoint
}
