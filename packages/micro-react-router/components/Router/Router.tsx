import { LocationDescriptorObject } from 'history'
import React from 'react'

import { Page } from '../Page'

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
