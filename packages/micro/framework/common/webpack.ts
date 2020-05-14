import { mergeDeepWith } from 'ramda'
import { Stats } from 'webpack'

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

export const getStatsForTarget = (target: 'nodejs' | 'webnew' | 'webold', stats: Stats.ToJsonOutput) =>
  stats.children?.find(s => s.name === target)
