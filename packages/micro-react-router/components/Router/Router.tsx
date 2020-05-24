import loadable from '@loadable/component'
import { canUseDOM } from '@vtex/micro'
import { LocationDescriptorObject } from 'history'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { Page } from '../Page'
import { RouterDOM } from './DynamicRouterDOM'
import { RouterSSR } from './RouterSSR'

export interface PageProps {
  data: any
}

export interface AsyncPageProps extends PageProps {
  name: string
}

export interface RouterProps {
  data: Page
  error: any
}

type AsyncImport = (x: { name: string}) => Promise<any>

export interface RouterStateModifier {
  // Prefetching should have lower priority than a preload. Also, you should be
  // carefull about preloading too mutch
  prefetchPage: (location: LocationDescriptorObject) => Promise<void>
  // Preload means the user needs this page right now. Use it only when you are
  // almost sure the user will navigate to this page
  preloadPage: (location: LocationDescriptorObject) => Promise<void>
}

export const MicroRouterContext = React.createContext<RouterStateModifier>({} as any)
MicroRouterContext.displayName = 'MicroRouterContext'

export const withRouter = (
  InitialPage: React.ElementType<PageProps>,
  AsyncImport: AsyncImport
): React.SFC<RouterProps> => {
  const AsyncPage = loadable<AsyncPageProps>(AsyncImport, {
    cacheKey: ({ name }) => name,
    ssr: false
  })

  return function MicroReactRouter ({ data, error }) {
    if (!canUseDOM) {
      return <RouterSSR data={data} error={error} InitialPage={InitialPage} />
    }

    // We could implement an static router in here as well
    return (
      <BrowserRouter>
        <RouterDOM
          data={data}
          error={error}
          InitialPage={InitialPage}
          AsyncPage={AsyncPage}
        />
      </BrowserRouter>
    )
  }
}
