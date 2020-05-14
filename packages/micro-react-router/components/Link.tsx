import React, { useContext, useEffect } from 'react'
import { Link as ReactRouterLink, useLocation } from 'react-router-dom'

import { locationFromProps } from './utils/location'
import { PagesContext } from './Router'

type ReactRouterLinkType = typeof ReactRouterLink

export const Link: ReactRouterLinkType = ({ children, to, ...rest }) => {
  const pages = useContext(PagesContext)
  const currentLocation = useLocation()

  useEffect(
    // eslint-disable-next-line no-unused-expressions
    () => { pages?.prefetch(locationFromProps(to as any, currentLocation)) },
    [currentLocation]
  )

  return (
    <ReactRouterLink to={to} {...rest}>
      { children }
    </ReactRouterLink>
  )
}
