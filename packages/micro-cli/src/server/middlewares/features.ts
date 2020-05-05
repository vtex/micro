import { Next } from 'koa'

import { Context } from '../typings'

export interface Features {
  disableSSR: boolean
  delayCriticalAssets?: number
  delayNonCriticalAssets?: number
}

const DEFAULT_FEATURES: Features = {
  disableSSR: false
} 

export const middleware = async (ctx: Context, next: Next) => {
  const maybeFeatures = ctx.cookies.get('micro-features')
  const features = {
    ...DEFAULT_FEATURES,
    ...maybeFeatures && JSON.parse(maybeFeatures)
  }
  ctx.state.features = features
  await next()
}