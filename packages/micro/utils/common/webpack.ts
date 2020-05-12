import { mergeDeepWith } from 'ramda'

export const mergeConfigs = <T>(a: T, b: T) => mergeDeepWith(
  (a, b) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.concat(b)
    } else {
      return b
    }
  },
  a,
  b
) as T
