import { LoadableComponent } from '@loadable/component'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { canUseDOM } from '@vtex/micro-plugin-react/components'

import { RouterDOM } from './DynamicRouterDOM'
import { RouterProps } from './Router'
import { RouterSSR } from './RouterSSR'

type AsyncPage = LoadableComponent<{ name: string; data: any }>

export const withRouter = (AsyncPage: AsyncPage): React.SFC<RouterProps> => {
  return function MicroReactRouter({ name, data, error }) {
    if (!canUseDOM) {
      return (
        <RouterSSR
          name={name}
          data={data}
          error={error}
          AsyncPage={AsyncPage}
        />
      )
    }

    // // We could implement an static router in here as well
    return (
      <BrowserRouter>
        <RouterDOM
          name={name}
          data={data}
          error={error}
          AsyncPage={AsyncPage}
        />
      </BrowserRouter>
    )
  }
}
