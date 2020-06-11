import React from 'react'

import { MicroRouterContext, RouterProps, RouterStateModifier } from './Router'
import { unpack } from '../utils/page'

type RouterSSRProps = RouterProps

export class RouterSSR extends React.Component<
  RouterSSRProps,
  RouterStateModifier
> {
  constructor(props: RouterSSRProps) {
    super(props)
    this.state = {
      prefetchPage: () => {
        throw new Error('💣 Cannot prefetch page in SSR')
      },
      preloadPage: () => {
        throw new Error('💣 Cannot fetch page in SSR')
      },
    }
  }

  public render = () => {
    const { AsyncPage, data, name } = this.props
    return (
      <MicroRouterContext.Provider value={this.state}>
        <AsyncPage name={name} data={unpack(data)} />
      </MicroRouterContext.Provider>
    )
  }
}
