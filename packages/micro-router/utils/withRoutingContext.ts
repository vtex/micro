import { ResolvedEntry } from '@vtex/micro'

export type RouterResolvedEntry<T> = Omit<ResolvedEntry<T>, 'context'> & {
  context: {
    entrypoint: string
    path: string
    context: T
  }
}

export const withRoutingContext = <T>({
  context,
  entry,
  status,
  path,
}: ResolvedEntry<T>): RouterResolvedEntry<T> => {
  return {
    context: {
      entrypoint: entry,
      path,
      context,
    },
    entry,
    status,
    path
  }
}
