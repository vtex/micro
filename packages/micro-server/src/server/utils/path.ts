import { Context } from '../typings'

export const pathFromContext = (ctx: Context) => `/${ctx.params.path || ''}`
