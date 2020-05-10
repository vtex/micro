import { Context } from 'koa'

export interface Features {
  disableSSR: boolean
}

const DEFAULT_FEATURES: Features = {
  disableSSR: false
}

export const featuresFromCtx = (ctx: Context) => {
  const maybeFeatures = ctx.cookies.get('micro-features')
  return {
    ...DEFAULT_FEATURES,
    ...maybeFeatures && JSON.parse(maybeFeatures)
  }
}
