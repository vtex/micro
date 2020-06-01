import cookie from 'cookie'

import { Req } from './typings'

export interface Features {
  disableSSR: boolean
}

const DEFAULT_FEATURES: Features = {
  disableSSR: false,
}

export const featuresFromReq = (req: Req) => {
  const cookies = req.headers.cookie
  const maybeFeaturesStr = cookies && cookie.parse(cookies)?.['micro-features']
  if (maybeFeaturesStr) {
    const maybeFeatures = JSON.parse(maybeFeaturesStr)
    return {
      ...DEFAULT_FEATURES,
      ...maybeFeatures,
    }
  }
  return DEFAULT_FEATURES
}
