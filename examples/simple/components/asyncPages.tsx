import loadable from '@loadable/component'
import { AsyncPageProps } from '@vtex/micro-router/components'

export const AsyncPages = loadable<AsyncPageProps>(
  ({ entrypoint }) => import(`./pages/${entrypoint}`), 
  { ssr: false }
)
