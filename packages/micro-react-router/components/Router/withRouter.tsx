import loadable from '@loadable/component'
import { canUseDOM } from '@vtex/micro-react/components'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { RouterDOM } from './DynamicRouterDOM'
import { AsyncPageProps, PageProps, RouterProps } from './Router'
import { RouterSSR } from './RouterSSR'

type AsyncImport = (x: { name: string}) => Promise<any>

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

    // // We could implement an static router in here as well
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
