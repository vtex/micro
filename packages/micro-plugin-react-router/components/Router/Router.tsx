import { LoadableComponent } from '@loadable/component'
import { LocationDescriptorObject } from 'history'
import React from 'react'

import { Page } from '../Page'

export interface PageProps {
  data: any
}

export interface AsyncPageProps extends PageProps {
  name: string
  data: string
}

export interface RouterProps {
  AsyncPage: LoadableComponent<AsyncPageProps>
  name: string
  error: any
  data: Page
}

export interface RouterStateModifier {
  // Prefetching should have lower priority than a preload. Also, you should be
  // carefull about preloading too mutch
  prefetchPage: (location: LocationDescriptorObject) => Promise<void>
  // Preload means the user needs this page right now. Use it only when you are
  // almost sure the user will navigate to this page
  preloadPage: (location: LocationDescriptorObject) => Promise<void>
}

export const MicroRouterContext = React.createContext<RouterStateModifier>(
  {} as any
)
MicroRouterContext.displayName = 'MicroRouterContext'
