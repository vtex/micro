import { ResolvedPage, Serializable } from '@vtex/micro'

export type RouterResolvedEntry<T> = {
  path: string
  data: T
}

export const unpack = <T extends Serializable>(packed: ResolvedPage<Packed<T>>) => packed.data.data

export const pack = <T extends Serializable>(resolved: ResolvedPage<T>, path: string): ResolvedPage<Packed<T>> => ({
  ...resolved,
  data: {
    data: resolved.data,
    name: resolved.name,
    path
  }
})

interface Packed <T extends Serializable> {
  data: T
  name: string
  path: string
}
