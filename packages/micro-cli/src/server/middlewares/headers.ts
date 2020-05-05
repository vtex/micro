import { Next } from 'koa'

import { Context } from '../typings'

export const middleware = async (ctx: Context, next: Next) => {
  try {
    ctx.set('cache-control', 'max-age=1200, public')
    await next()
  } catch (err) {
    ctx.set('cache-control', 'max-age=10, public')
    throw err
  }
}
