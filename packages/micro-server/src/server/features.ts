import { JSONCookie } from 'cookie-parser'

import { Req } from './typings'

export interface Features {
  disableSSR: boolean
}

const DEFAULT_FEATURES: Features = {
  disableSSR: false
}

export const featuresFromReq = (req: Req) => {
  const cookie = req.headers.cookie
  if (cookie) {
    const maybeFeatures = JSONCookie(cookie)
    return {
      ...DEFAULT_FEATURES,
      ...maybeFeatures
    }
  }
  return DEFAULT_FEATURES
}
