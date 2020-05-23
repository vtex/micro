import { LoadableComponent } from '@loadable/component'
import { canUseDOM } from '@vtex/micro'
import { LocationDescriptorObject } from 'history'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { Page } from '../Page'
import { RouterDOM } from './RouterDOM'
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

export interface RouterStateModifier {
  prefetchAsset: (page: Page) => Promise<void>
  prefetchPage: (location: LocationDescriptorObject) => Promise<void>
  preloadPage: (location: LocationDescriptorObject) => Promise<void>
}

export const MicroRouterContext = React.createContext<RouterStateModifier>({} as any)
MicroRouterContext.displayName = 'MicroRouterContext'

export const withRouter = (
  InitialPage: React.ElementType<PageProps>,
  AsyncPage: LoadableComponent<AsyncPageProps>
): React.SFC<RouterProps> => ({ data, error }) => {
  if (!canUseDOM) {
    return <RouterSSR data={data} error={error} InitialPage={InitialPage} />
  }

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
