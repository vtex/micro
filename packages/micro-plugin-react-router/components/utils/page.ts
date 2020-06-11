import { ResolvedPage, Serializable } from '@vtex/micro-core'

import { Page } from '../Page'

export const unpack = <T extends Serializable>(packed: Page<T>) => packed.data

export const pack = <T extends Serializable>(
  resolved: ResolvedPage<T>,
  path: string
): ResolvedPage<Page<T>> => ({
  ...resolved,
  data: {
    data: resolved.data,
    name: resolved.name,
    path,
  },
})
