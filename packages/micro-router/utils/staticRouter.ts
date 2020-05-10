import { UserConfig } from '@vtex/micro'
import { match, matchPath } from 'react-router-dom'

import { withRoutingContext } from './withRoutingContext'

interface StaticRouterConfig {
  entry: string
  loadContext: (route: match<any>) => Promise<any>
  status: number
  path: string
}

export const staticRouter = (routes: StaticRouterConfig[]): UserConfig['router'] => async (path: string) => {
  const route = routes.find(route => matchPath(path, route))

  if (!route) {
    throw new Error('💣 Route not Found')
  }

  const match = matchPath(path, route)
  const context = await route.loadContext(match!)

  return withRoutingContext({
    entry: route.entry,
    context,
    status: route.status,
    path
  })
}
