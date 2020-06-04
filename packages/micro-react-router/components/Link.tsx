import React, { useContext, useEffect, useRef } from 'react'
import { useInViewport } from 'react-in-viewport'
import {
  Link as ReactRouterLink,
  LinkProps as ReactRouterLinkProps,
  useLocation,
} from 'react-router-dom'

import { MicroRouterContext } from './Router/Router'
import { onMobileDevice } from './utils/env'
import { locationFromProps } from './utils/location'

export type LinkProps = ReactRouterLinkProps & {
  prefetch?: boolean
}

const noop = () => {}

export const Link: React.SFC<LinkProps> = ({
  children,
  to,
  prefetch = false,
  ...rest
}) => {
  const router = useContext(MicroRouterContext)
  const currentLocation = useLocation()

  let fetched = false
  const prefetchPage = (condition: boolean) => () => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (!fetched && condition) {
      fetched = true
      router.prefetchPage(locationFromProps(to as any, currentLocation))
    }
  }
  const preloadPage = () => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (!fetched) {
      fetched = true
      router.preloadPage(locationFromProps(to as any, currentLocation))
    }
  }

  const node = useRef(null)
  useInViewport(
    node,
    null,
    { disconnectOnLeave: true },
    {
      onEnterViewport: prefetchPage(onMobileDevice),
      onLeaveViewport: noop,
    }
  )

  useEffect(prefetchPage(prefetch), [currentLocation, prefetch])

  return (
    <ReactRouterLink
      ref={node}
      to={to}
      // We preload the page in here becase it seems like the user is about to navigate
      onMouseEnter={preloadPage}
      {...rest}
    >
      {children}
    </ReactRouterLink>
  )
}
