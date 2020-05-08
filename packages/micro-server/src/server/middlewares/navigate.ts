import { Next } from 'koa'

import { Context } from '../typings'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

export const middleware = async (ctx: Context, next: Next) => {
  const {
    state: { server: { resolvedEntry } }
  } = ctx

  if (!resolvedEntry) {
    throw new Error('💣 Something went wrong while navigating')
  }

  const { context } = resolvedEntry

  ctx.body = context
}
