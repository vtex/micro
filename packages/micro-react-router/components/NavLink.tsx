import React, { useContext, useEffect, useRef } from 'react'
import { useInViewport } from 'react-in-viewport'
import {
  NavLinkProps,
  NavLink as ReactRouterNavLink,
  useLocation
} from 'react-router-dom'

import { MicroRouterContext } from './Router/Router'
import { onMobileDevice } from './utils/env'
import { locationFromProps } from './utils/location'

type Props = NavLinkProps & {
  prefetch?: boolean
}

const noop = () => {}

export const NavLink: React.SFC<Props> = ({ children, to, prefetch = false, ...rest }) => {
  const router = useContext(MicroRouterContext)
  const currentLocation = useLocation()

  let fetched = false
  const prefetchPage = (condition: boolean) => () => {
    if (!fetched && condition) {
      fetched = true
      router.prefetchPage(locationFromProps(to as any, currentLocation))
    }
  }
  const preloadPage = () => {
    if (!fetched) {
      fetched = true
      router.preloadPage(locationFromProps(to as any, currentLocation))
    }
  }

  const node = useRef(null)
  useInViewport(node, null, { disconnectOnLeave: true }, {
    onEnterViewport: prefetchPage(onMobileDevice),
    onLeaveViewport: noop
  })

  useEffect(prefetchPage(prefetch), [currentLocation, prefetch])

  return (
    <ReactRouterNavLink
      ref={node}
      to={to}
      // We preload the page in here becase it seems like the user is about to navigate
      onMouseEnter={preloadPage}
      {...rest}
    >
      { children }
    </ReactRouterNavLink>
  )
}
