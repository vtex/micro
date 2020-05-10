import { Context } from '../typings'

export const middleware = async (ctx: Context) => {
  const {
    state: { server: { resolvedEntry } }
  } = ctx

  if (!resolvedEntry) {
    throw new Error('💣 Something went wrong while navigating')
  }

  const { context } = resolvedEntry

  ctx.body = context
}
