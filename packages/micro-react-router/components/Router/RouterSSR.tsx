import React from 'react'

import { unpack } from '../Page'
import {
  MicroRouterContext,
  PageProps,
  RouterProps,
  RouterStateModifier
} from './Router'

interface RouterSSRProps extends RouterProps {
  InitialPage: React.ElementType<PageProps>
}

export class RouterSSR extends React.Component<RouterSSRProps, RouterStateModifier> {
  constructor (props: RouterSSRProps) {
    super(props)
    this.state = {
      prefetchAsset: () => { throw new Error('💣 Cannot prefetch assets in SSR') },
      prefetchPage: () => { throw new Error('💣 Cannot prefetch page in SSR') },
      preloadPage: () => { throw new Error('💣 Cannot fetch page in SSR') }
    }
  }

  public render = () => {
    const { InitialPage } = this.props
    return (
      <MicroRouterContext.Provider value={this.state}>
        <InitialPage data={unpack(this.props.data)} />
      </MicroRouterContext.Provider>
    )
  }
}
