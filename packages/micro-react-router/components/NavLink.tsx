import React, { useContext, useEffect } from 'react'
import { NavLink as NavReactRouterLink, useLocation } from 'react-router-dom'

import { locationFromProps } from './utils/location'
import { PagesContext } from './Router'

type ReactRouterLinkType = typeof NavReactRouterLink

export const NavLink: ReactRouterLinkType = ({ children, to, ...rest }) => {
  const pages = useContext(PagesContext)
  const currentLocation = useLocation()

  useEffect(
    // eslint-disable-next-line no-unused-expressions
    () => { pages?.prefetch(locationFromProps(to as any, currentLocation)) },
    [currentLocation]
  )

  return (
    <NavReactRouterLink to={to} {...rest}>
      { children }
    </NavReactRouterLink>
  )
}
