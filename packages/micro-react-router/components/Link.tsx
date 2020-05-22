import React, { useContext, useEffect } from 'react'
import { Link as ReactRouterLink, useLocation } from 'react-router-dom'

import { locationFromProps } from './utils/location'
import { MicroRouterContext } from './Router/Router'

type ReactRouterLinkType = typeof ReactRouterLink

export const Link: ReactRouterLinkType = ({ children, to, ...rest }) => {
  const router = useContext(MicroRouterContext)
  const currentLocation = useLocation()

  useEffect(
    // eslint-disable-next-line no-unused-expressions
    () => { router.prefetchPage(locationFromProps(to as any, currentLocation)) },
    [currentLocation]
  )

  return (
    <ReactRouterLink to={to} {...rest}>
      { children }
    </ReactRouterLink>
  )
}
