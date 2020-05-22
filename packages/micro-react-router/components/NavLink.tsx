import React, { useContext, useEffect } from 'react'
import { NavLink as NavReactRouterLink, useLocation } from 'react-router-dom'

import { locationFromProps } from './utils/location'
import { MicroRouterContext } from './Router/Router'

type ReactRouterLinkType = typeof NavReactRouterLink

export const NavLink: ReactRouterLinkType = ({ children, to, ...rest }) => {
  const router = useContext(MicroRouterContext)
  const currentLocation = useLocation()

  useEffect(
    // eslint-disable-next-line no-unused-expressions
    () => { router?.prefetchPage(locationFromProps(to as any, currentLocation)) }, // TODO: remove this as any
    [currentLocation]
  )

  return (
    <NavReactRouterLink to={to} {...rest}>
      { children }
    </NavReactRouterLink>
  )
}
